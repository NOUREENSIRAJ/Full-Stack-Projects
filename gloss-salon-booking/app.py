"""Gloss — salon chair booking.

Slots are duration-aware: a 90-minute colour blocks three half-hour slots
on that stylist's chair, so nothing double-books.

Run:  python app.py   ->  http://127.0.0.1:5002
"""

import os
import sqlite3
from datetime import date, datetime, timedelta

from flask import Flask, flash, g, redirect, render_template, request, url_for

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "gloss.db")

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "gloss-dev-key-change-me")

# --- Salon data ------------------------------------------------------------

SERVICES = {
    "cut-blowdry": {
        "id": "cut-blowdry",
        "name": "Cut & blow-dry",
        "group": "Hair",
        "minutes": 60,
        "price": 1400,
        "blurb": "Consultation, wash, precision cut, finished with a smooth blow-dry.",
    },
    "gloss-colour": {
        "id": "gloss-colour",
        "name": "Full colour & gloss",
        "group": "Hair",
        "minutes": 150,
        "price": 4200,
        "blurb": "Root-to-tip colour with a shine gloss sealed in at the basin.",
    },
    "balayage": {
        "id": "balayage",
        "name": "Balayage",
        "group": "Hair",
        "minutes": 180,
        "price": 5600,
        "blurb": "Hand-painted lightening, toned to your base and blow-dried out.",
    },
    "keratin": {
        "id": "keratin",
        "name": "Keratin smoothing",
        "group": "Hair",
        "minutes": 120,
        "price": 4800,
        "blurb": "Frizz treatment that holds for eight to twelve weeks.",
    },
    "facial": {
        "id": "facial",
        "name": "Deep-clean facial",
        "group": "Skin",
        "minutes": 60,
        "price": 2200,
        "blurb": "Steam, extraction, mask and massage for congested skin.",
    },
    "threading": {
        "id": "threading",
        "name": "Brow shaping",
        "group": "Skin",
        "minutes": 30,
        "price": 350,
        "blurb": "Threaded and mapped to your face, tinted on request.",
    },
    "gel-mani": {
        "id": "gel-mani",
        "name": "Gel manicure",
        "group": "Nails",
        "minutes": 60,
        "price": 1200,
        "blurb": "Shaped, cuticle work, and a gel colour cured to last three weeks.",
    },
    "pedi": {
        "id": "pedi",
        "name": "Spa pedicure",
        "group": "Nails",
        "minutes": 90,
        "price": 1800,
        "blurb": "Soak, scrub, callus work and a leg massage. Polish optional.",
    },
}

GROUP_ORDER = ["Hair", "Skin", "Nails"]

STYLISTS = {
    "noureen": {
        "id": "noureen",
        "name": "Noureen",
        "initials": "N",
        "title": "Creative director",
        "does": ["cut-blowdry", "gloss-colour", "balayage", "keratin"],
        "bio": "Fifteen years behind the chair. Curls, fringes and warm blondes.",
    },
    "ariba": {
        "id": "ariba",
        "name": "Ariba",
        "initials": "A",
        "title": "Senior stylist",
        "does": ["cut-blowdry", "gloss-colour", "keratin"],
        "bio": "Sharp bobs and low-maintenance colour that grows out cleanly.",
    },
    "hira": {
        "id": "hira",
        "name": "Hira",
        "initials": "H",
        "title": "Skin therapist",
        "does": ["facial", "threading"],
        "bio": "Trained in acne and pigmentation care. Very gentle hands.",
    },
    "zainab": {
        "id": "zainab",
        "name": "Zainab",
        "initials": "Z",
        "title": "Nail artist",
        "does": ["gel-mani", "pedi", "threading"],
        "bio": "Freehand art, chrome finishes, and the neatest cuticle work here.",
    },
}

OPEN_HOUR, CLOSE_HOUR, STEP = 10, 19, 30  # 10:00 to 19:00, half-hour grid


def slot_grid():
    times, cursor = [], datetime(2000, 1, 1, OPEN_HOUR, 0)
    end = datetime(2000, 1, 1, CLOSE_HOUR, 0)
    while cursor < end:
        times.append(cursor.strftime("%H:%M"))
        cursor += timedelta(minutes=STEP)
    return times


SLOTS = slot_grid()

# --- Database --------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ref         TEXT NOT NULL UNIQUE,
    service_id  TEXT NOT NULL,
    stylist_id  TEXT NOT NULL,
    slot_date   TEXT NOT NULL,
    start_time  TEXT NOT NULL,
    end_time    TEXT NOT NULL,
    minutes     INTEGER NOT NULL,
    price       INTEGER NOT NULL,
    client      TEXT NOT NULL,
    phone       TEXT NOT NULL,
    notes       TEXT,
    created_at  TEXT NOT NULL
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


def salon_days(count=7):
    """Next `count` open days (closed Monday)."""
    days, cursor = [], date.today()
    while len(days) < count:
        if cursor.weekday() != 0:
            days.append(cursor)
        cursor += timedelta(days=1)
    return days


def blocked_slots(stylist_id, day):
    """Every half-hour slot already consumed on that stylist's chair."""
    rows = get_db().execute(
        "SELECT start_time, minutes FROM bookings WHERE stylist_id = ? AND slot_date = ?",
        (stylist_id, day),
    ).fetchall()
    taken = set()
    for r in rows:
        start = SLOTS.index(r["start_time"]) if r["start_time"] in SLOTS else None
        if start is None:
            continue
        for i in range(start, start + max(1, r["minutes"] // STEP)):
            if i < len(SLOTS):
                taken.add(SLOTS[i])
    return taken


def open_starts(stylist_id, day, minutes):
    """Start times where the whole treatment fits before closing."""
    need = max(1, minutes // STEP)
    taken = blocked_slots(stylist_id, day)
    starts = []
    for i, t in enumerate(SLOTS):
        window = SLOTS[i : i + need]
        fits = len(window) == need and not any(w in taken for w in window)
        starts.append({"time": t, "open": fits})
    return starts


def end_time(start, minutes):
    dt = datetime.strptime(start, "%H:%M") + timedelta(minutes=minutes)
    return dt.strftime("%H:%M")


def make_ref():
    n = get_db().execute("SELECT COUNT(*) c FROM bookings").fetchone()["c"]
    return f"GL{datetime.now().strftime('%y%m')}{n + 1:03d}"


@app.template_filter("pretty_date")
def pretty_date(value):
    return datetime.strptime(value, "%Y-%m-%d").strftime("%a %d %b")


@app.template_filter("pkr")
def pkr(amount):
    """1400 -> 'PKR 1,400'"""
    return f"PKR {int(amount):,}"


@app.template_filter("as_hours")
def as_hours(mins):
    h, m = divmod(mins, 60)
    if h and m:
        return f"{h} hr {m} min"
    if h:
        return f"{h} hr"
    return f"{m} min"


# --- Routes ----------------------------------------------------------------


@app.route("/")
def index():
    menu = [
        (grp, [s for s in SERVICES.values() if s["group"] == grp]) for grp in GROUP_ORDER
    ]
    return render_template("index.html", menu=menu, stylists=STYLISTS.values())


@app.route("/book/<service_id>", methods=["GET", "POST"])
def book(service_id):
    service = SERVICES.get(service_id)
    if service is None:
        return render_template("not_found.html"), 404

    team = [s for s in STYLISTS.values() if service_id in s["does"]]
    days = salon_days()
    day_values = [d.isoformat() for d in days]

    chosen_day = request.values.get("day") or day_values[0]
    if chosen_day not in day_values:
        chosen_day = day_values[0]
    chosen_stylist = request.values.get("stylist") or team[0]["id"]
    if chosen_stylist not in [s["id"] for s in team]:
        chosen_stylist = team[0]["id"]

    if request.method == "POST":
        form = request.form
        start = form.get("start_time", "")
        client = form.get("client", "").strip()
        phone = form.get("phone", "").strip()

        errors = []
        if not client:
            errors.append("Tell us who the appointment is for.")
        if len(phone) < 10 or not phone.replace("+", "").replace(" ", "").isdigit():
            errors.append("Add a 10-digit mobile number for the reminder text.")
        if not start:
            errors.append("Choose a start time.")
        else:
            avail = {s["time"]: s["open"] for s in open_starts(chosen_stylist, chosen_day, service["minutes"])}
            if not avail.get(start):
                errors.append(f"{start} no longer fits a {as_hours(service['minutes'])} appointment. Pick another time.")

        if errors:
            for e in errors:
                flash(e, "error")
        else:
            ref = make_ref()
            db = get_db()
            db.execute(
                """INSERT INTO bookings
                   (ref, service_id, stylist_id, slot_date, start_time, end_time,
                    minutes, price, client, phone, notes, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    ref,
                    service_id,
                    chosen_stylist,
                    chosen_day,
                    start,
                    end_time(start, service["minutes"]),
                    service["minutes"],
                    service["price"],
                    client,
                    phone,
                    form.get("notes", "").strip(),
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
            db.commit()
            return redirect(url_for("booked", ref=ref))

    return render_template(
        "book.html",
        service=service,
        team=team,
        days=days,
        chosen_day=chosen_day,
        chosen_stylist=chosen_stylist,
        stylist=STYLISTS[chosen_stylist],
        starts=open_starts(chosen_stylist, chosen_day, service["minutes"]),
        form=request.form,
    )


@app.route("/booked/<ref>")
def booked(ref):
    row = get_db().execute("SELECT * FROM bookings WHERE ref = ?", (ref,)).fetchone()
    if row is None:
        return render_template("not_found.html"), 404
    return render_template(
        "booked.html",
        b=row,
        service=SERVICES[row["service_id"]],
        stylist=STYLISTS[row["stylist_id"]],
    )


@app.route("/diary")
def diary():
    rows = get_db().execute(
        "SELECT * FROM bookings ORDER BY slot_date, start_time"
    ).fetchall()
    return render_template("diary.html", rows=rows, services=SERVICES, stylists=STYLISTS)


@app.route("/diary/<int:booking_id>/cancel", methods=["POST"])
def cancel(booking_id):
    db = get_db()
    db.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    db.commit()
    flash("Appointment cancelled. The chair is free again.", "ok")
    return redirect(url_for("diary"))


# Runs on import too, so the table exists when a WSGI server starts the app.
init_db()


if __name__ == "__main__":
    app.run(debug=True, port=5002)
