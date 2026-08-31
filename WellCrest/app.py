"""Wellcrest — outpatient (OPD) appointment booking.

Run:  python app.py   ->  http://127.0.0.1:5001
"""

import os
import re
import sqlite3
from datetime import date, datetime, timedelta

from flask import Flask, flash, g, redirect, render_template, request, url_for

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "wellcrest.db")

app = Flask(__name__)
app.secret_key = "wellcrest-dev-key-change-me"

# --- Clinic identity -------------------------------------------------------
# Change anything here and it updates across every page.

CLINIC = {
    "name": "Wellcrest",
    "tagline": "Outpatient appointments, booked in under a minute.",
    "address": "DHA Phase 4, Karachi",
    "phone": "021-3111 4400",
    "phone_dial": "+922131114400",
    "hours": "Mon–Sat, 9:00 AM – 6:40 PM. Closed Sunday.",
    "currency": "Rs",
}

# --- Clinic data -----------------------------------------------------------

DOCTORS = {
    "dr-noureen": {
        "id": "dr-noureen",
        "name": "Dr. Noureen Siddiqui",
        "dept": "Cardiology",
        "code": "CARD",
        "qual": "MBBS, FCPS, MD (Cardiology)",
        "room": "B-204",
        "fee": 900,
        "years": 14,
        "note": "Chest pain, blood pressure, post-angioplasty follow-up.",
    },
    "dr-usman": {
        "id": "dr-usman",
        "name": "Dr. Usman Farooq",
        "dept": "Dermatology",
        "code": "DERM",
        "qual": "MBBS, MD (Skin & VD)",
        "room": "A-118",
        "fee": 700,
        "years": 9,
        "note": "Acne, eczema, hair fall, allergy patch testing.",
    },
    "dr-sana": {
        "id": "dr-sana",
        "name": "Dr. Sana Khan",
        "dept": "Paediatrics",
        "code": "PAED",
        "qual": "MBBS, DCH",
        "room": "G-012",
        "fee": 650,
        "years": 11,
        "note": "Vaccination, growth checks, fever and cough in children.",
    },
    "dr-bilal": {
        "id": "dr-bilal",
        "name": "Dr. Bilal Ansari",
        "dept": "Orthopaedics",
        "code": "ORTH",
        "qual": "MBBS, MS (Orthopaedics)",
        "room": "C-305",
        "fee": 850,
        "years": 17,
        "note": "Knee and back pain, fractures, sports injury review.",
    },
    "dr-hira": {
        "id": "dr-hira",
        "name": "Dr. Hira Shaikh",
        "dept": "General Medicine",
        "code": "GMED",
        "qual": "MBBS, MD",
        "room": "A-101",
        "fee": 500,
        "years": 7,
        "note": "Fever, diabetes and thyroid review, general check-up.",
    },
}

MORNING = ["09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20"]
EVENING = ["16:00", "16:20", "16:40", "17:00", "17:20", "17:40", "18:00", "18:20"]
SESSIONS = [("Morning OPD", MORNING), ("Evening OPD", EVENING)]

REASONS = [
    "First visit",
    "Follow-up",
    "Report review",
    "Prescription refill",
    "Second opinion",
]


# --- Database --------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS appointments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    token      TEXT NOT NULL,
    doctor_id  TEXT NOT NULL,
    slot_date  TEXT NOT NULL,
    slot_time  TEXT NOT NULL,
    patient    TEXT NOT NULL,
    age        INTEGER,
    phone      TEXT NOT NULL,
    reason     TEXT,
    notes      TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (doctor_id, slot_date, slot_time)
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


# --- Helpers ---------------------------------------------------------------


def clinic_days(count=7):
    """Next `count` days the OPD runs (closed Sunday)."""
    days, cursor = [], date.today()
    while len(days) < count:
        if cursor.weekday() != 6:
            days.append(cursor)
        cursor += timedelta(days=1)
    return days


def taken_slots(doctor_id, day):
    rows = get_db().execute(
        "SELECT slot_time FROM appointments WHERE doctor_id = ? AND slot_date = ?",
        (doctor_id, day),
    ).fetchall()
    return {r["slot_time"] for r in rows}


def booked_count(doctor_id, day):
    return len(taken_slots(doctor_id, day))


def make_token(doctor, day):
    n = get_db().execute(
        "SELECT COUNT(*) c FROM appointments WHERE doctor_id = ? AND slot_date = ?",
        (doctor["id"], day),
    ).fetchone()["c"]
    return f"{doctor['code']}-{day.replace('-', '')[4:]}-{n + 1:02d}"


@app.template_filter("pretty_date")
def pretty_date(value):
    d = datetime.strptime(value, "%Y-%m-%d").date()
    return d.strftime("%a %d %b %Y")


@app.template_filter("rs")
def rs(value):
    """900 -> 'Rs 900'   |   12500 -> 'Rs 12,500'"""
    return f"{CLINIC['currency']} {int(value):,}"


@app.context_processor
def inject_clinic():
    return {"clinic": CLINIC}


# --- Routes ----------------------------------------------------------------


@app.route("/")
def index():
    today = date.today().isoformat()
    total = len(MORNING) + len(EVENING)
    doctors = []
    for doc in DOCTORS.values():
        free = total - booked_count(doc["id"], today)
        doctors.append({**doc, "free_today": free, "total_today": total})
    return render_template("index.html", doctors=doctors, today=today)


@app.route("/doctor/<doctor_id>", methods=["GET", "POST"])
def book(doctor_id):
    doctor = DOCTORS.get(doctor_id)
    if doctor is None:
        return render_template("not_found.html"), 404

    days = clinic_days()
    day_values = [d.isoformat() for d in days]
    chosen_day = request.values.get("day") or day_values[0]
    if chosen_day not in day_values:
        chosen_day = day_values[0]

    if request.method == "POST":
        form = request.form
        slot = form.get("slot_time", "")
        patient = form.get("patient", "").strip()
        phone = form.get("phone", "").strip()
        digits = re.sub(r"\D", "", phone)

        errors = []
        if not patient:
            errors.append("Enter the patient's full name.")
        if not (10 <= len(digits) <= 13):
            errors.append(
                "Enter a valid mobile number, e.g. 0300 1234567, "
                "so the clinic can reach you."
            )
        if not slot:
            errors.append("Pick a time slot from the schedule.")
        elif slot in taken_slots(doctor_id, chosen_day):
            errors.append(f"{slot} was just taken. Pick another slot.")

        if errors:
            for e in errors:
                flash(e, "error")
        else:
            token = make_token(doctor, chosen_day)
            db = get_db()
            try:
                db.execute(
                    """INSERT INTO appointments
                       (token, doctor_id, slot_date, slot_time, patient, age,
                        phone, reason, notes, created_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?)""",
                    (
                        token,
                        doctor_id,
                        chosen_day,
                        slot,
                        patient,
                        form.get("age") or None,
                        phone,
                        form.get("reason", "First visit"),
                        form.get("notes", "").strip(),
                        datetime.now().isoformat(timespec="seconds"),
                    ),
                )
                db.commit()
            except sqlite3.IntegrityError:
                flash(f"{slot} was just taken. Pick another slot.", "error")
            else:
                return redirect(url_for("confirmed", token=token))

    booked = taken_slots(doctor_id, chosen_day)
    return render_template(
        "book.html",
        doctor=doctor,
        days=days,
        chosen_day=chosen_day,
        sessions=SESSIONS,
        booked=booked,
        reasons=REASONS,
        form=request.form,
    )


@app.route("/confirmed/<token>")
def confirmed(token):
    row = get_db().execute(
        "SELECT * FROM appointments WHERE token = ?", (token,)
    ).fetchone()
    if row is None:
        return render_template("not_found.html"), 404
    return render_template("confirmed.html", a=row, doctor=DOCTORS.get(row["doctor_id"]))


@app.route("/appointments")
def appointments():
    rows = get_db().execute(
        "SELECT * FROM appointments ORDER BY slot_date, slot_time"
    ).fetchall()
    return render_template("appointments.html", rows=rows, doctors=DOCTORS)


@app.route("/appointments/<int:appt_id>/cancel", methods=["POST"])
def cancel(appt_id):
    db = get_db()
    db.execute("DELETE FROM appointments WHERE id = ?", (appt_id,))
    db.commit()
    flash("Appointment cancelled. The slot is open again.", "ok")
    return redirect(url_for("appointments"))


init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
