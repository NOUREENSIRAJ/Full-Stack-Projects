"""Luna & Spice — restaurant table reservations.

Capacity is tracked per seating area per sitting, so a room fills up
instead of accepting an endless number of bookings.

Run:  python app.py   ->  http://127.0.0.1:5003
"""

import os
import sqlite3
from datetime import date, datetime, timedelta

from flask import Flask, flash, g, redirect, render_template, request, url_for

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "luna_spice.db")

app = Flask(__name__)
app.secret_key = "luna-spice-dev-key-change-me"

# --- Restaurant data -------------------------------------------------------

AREAS = {
    "dining": {
        "id": "dining",
        "name": "Dining room",
        "covers": 38,
        "max_party": 8,
        "blurb": "Banquettes and low light under the old skylight.",
    },
    "terrace": {
        "id": "terrace",
        "name": "Garden terrace",
        "covers": 24,
        "max_party": 10,
        "blurb": "Open air, heaters after sunset, partly covered if it rains.",
    },
    "counter": {
        "id": "counter",
        "name": "Chef's counter",
        "covers": 8,
        "max_party": 4,
        "blurb": "Eight stools facing the pass. Tasting menu only.",
    },
}

SITTINGS = [
    ("Lunch", ["12:00", "12:30", "13:00", "13:30", "14:00"]),
    ("Dinner", ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"]),
]

ALL_TIMES = [t for _, times in SITTINGS for t in times]

OCCASIONS = ["Just dinner", "Birthday", "Anniversary", "Business", "Celebration"]

MENU_NOTES = [
    ("Tasting menu", "7 courses, Rs 3,200 per head. Counter guests only."),
    ("A la carte", "Served in the dining room and on the terrace."),
    ("Kitchen garden", "Vegetarian and vegan menus are full menus, not swaps."),
]

# --- Database --------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS reservations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ref        TEXT NOT NULL UNIQUE,
    area_id    TEXT NOT NULL,
    res_date   TEXT NOT NULL,
    res_time   TEXT NOT NULL,
    party      INTEGER NOT NULL,
    guest      TEXT NOT NULL,
    phone      TEXT NOT NULL,
    email      TEXT,
    occasion   TEXT,
    requests   TEXT,
    created_at TEXT NOT NULL
);
"""


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.executescript(SCHEMA)
    con.commit()
    con.close()


# --- Availability ----------------------------------------------------------


def service_days(count=10):
    """Next `count` days the kitchen is open (closed Monday)."""
    days, cursor = [], date.today()
    while len(days) < count:
        if cursor.weekday() != 0:
            days.append(cursor)
        cursor += timedelta(days=1)
    return days


def seated(area_id, day, time):
    row = get_db().execute(
        """SELECT COALESCE(SUM(party), 0) n FROM reservations
           WHERE area_id = ? AND res_date = ? AND res_time = ?""",
        (area_id, day, time),
    ).fetchone()
    return row["n"]


def availability(area_id, day, party):
    """One entry per sitting time: covers left and whether the party fits."""
    area = AREAS[area_id]
    out = []
    for label, times in SITTINGS:
        rows = []
        for t in times:
            left = area["covers"] - seated(area_id, day, t)
            rows.append({"time": t, "left": left, "open": left >= party})
        out.append((label, rows))
    return out


def make_ref(day):
    n = get_db().execute(
        "SELECT COUNT(*) c FROM reservations WHERE res_date = ?", (day,)
    ).fetchone()["c"]
    return f"LS{day.replace('-', '')[2:]}-{n + 1:02d}"


@app.template_filter("pretty_date")
def pretty_date(value):
    return datetime.strptime(value, "%Y-%m-%d").strftime("%A %d %B")


@app.template_filter("short_date")
def short_date(value):
    return datetime.strptime(value, "%Y-%m-%d").strftime("%d %b")


# --- Routes ----------------------------------------------------------------


@app.route("/")
def index():
    return render_template("index.html", areas=AREAS.values(), menu_notes=MENU_NOTES)


@app.route("/reserve", methods=["GET", "POST"])
def reserve():
    days = service_days()
    day_values = [d.isoformat() for d in days]

    area_id = request.values.get("area") or "dining"
    if area_id not in AREAS:
        area_id = "dining"
    area = AREAS[area_id]

    try:
        party = int(request.values.get("party", 2))
    except ValueError:
        party = 2
    party = max(1, min(party, area["max_party"]))

    chosen_day = request.values.get("day") or day_values[0]
    if chosen_day not in day_values:
        chosen_day = day_values[0]

    if request.method == "POST":
        form = request.form
        time = form.get("res_time", "")
        guest = form.get("guest", "").strip()
        phone = form.get("phone", "").strip()

        errors = []
        if not guest:
            errors.append("Add the name the table should be held under.")
        if len(phone) < 10 or not phone.replace("+", "").replace(" ", "").isdigit():
            errors.append("Add a 10-digit mobile number so we can confirm.")
        if time not in ALL_TIMES:
            errors.append("Choose a sitting time.")
        elif area["covers"] - seated(area_id, chosen_day, time) < party:
            errors.append(f"{time} no longer seats {party}. Try another time or area.")

        if errors:
            for e in errors:
                flash(e, "error")
        else:
            ref = make_ref(chosen_day)
            db = get_db()
            db.execute(
                """INSERT INTO reservations
                   (ref, area_id, res_date, res_time, party, guest, phone,
                    email, occasion, requests, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    ref,
                    area_id,
                    chosen_day,
                    time,
                    party,
                    guest,
                    phone,
                    form.get("email", "").strip(),
                    form.get("occasion", "Just dinner"),
                    form.get("requests", "").strip(),
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
            db.commit()
            return redirect(url_for("reserved", ref=ref))

    return render_template(
        "reserve.html",
        areas=AREAS,
        area=area,
        party=party,
        days=days,
        chosen_day=chosen_day,
        sittings=availability(area_id, chosen_day, party),
        occasions=OCCASIONS,
        form=request.form,
    )


@app.route("/reserved/<ref>")
def reserved(ref):
    row = get_db().execute("SELECT * FROM reservations WHERE ref = ?", (ref,)).fetchone()
    if row is None:
        return render_template("not_found.html"), 404
    return render_template("reserved.html", r=row, area=AREAS[row["area_id"]])


@app.route("/book")
def book_list():
    rows = get_db().execute(
        "SELECT * FROM reservations ORDER BY res_date, res_time"
    ).fetchall()
    total = sum(r["party"] for r in rows)
    return render_template("book.html", rows=rows, areas=AREAS, total=total)


@app.route("/book/<int:res_id>/cancel", methods=["POST"])
def cancel(res_id):
    db = get_db()
    db.execute("DELETE FROM reservations WHERE id = ?", (res_id,))
    db.commit()
    flash("Reservation cancelled. Those covers are back on the floor.", "ok")
    return redirect(url_for("book_list"))


init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5003)
