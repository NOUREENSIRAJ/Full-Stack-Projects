# Wellcrest

An outpatient (OPD) appointment booking system for a clinic in DHA Phase 4, Karachi.
Patients pick a doctor, pick a free slot from the next seven working days, and get a
printable token slip. The front desk can see every booking in one place and cancel
any of them, which puts the slot back on the schedule.

Built with Flask and SQLite.

## Screenshots

**Doctor panel** — the five consultants on duty, their fees, and how many slots are
still open today.

![Doctor panel] <img width="1551" height="907" alt="Screenshot wellcrest 1" src="https://github.com/user-attachments/assets/b40ae6a2-68c6-49c0-bb18-db21bf23770d" />


**Token slip** — what the patient gets after booking. The page is styled to print
cleanly on white paper.

![Token slip] <img width="1551" height="907" alt="Screenshot wellcrest 1" src="https://github.com/user-attachments/assets/830dc726-c4a4-436b-85ac-7abfd96af656" />


## What it does

- Five doctors across cardiology, dermatology, paediatrics, orthopaedics and general medicine
- 16 slots a day per doctor, 20 minutes each, split into a morning and an evening OPD
- Seven-day schedule that skips Sundays
- Live slot availability, so booked times are shown crossed out and can't be picked
- Auto-generated token numbers like `ORTH-0905-01` (department, date, serial)
- Form validation on patient name, mobile number and slot selection
- A database constraint on doctor + date + time, so two patients can never end up
  holding the same slot even if they submit at the same moment
- Front desk view with cancellation

## Running it

```
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5001

The SQLite database is created automatically on first run.

## Project structure

```
wellcrest/
├── app.py              routes, clinic data, database access
├── wellcrest.db        SQLite database
├── requirements.txt
├── static/
│   └── style.css
└── templates/
    ├── base.html       shared layout, header and footer
    ├── index.html      doctor panel
    ├── book.html       day picker, slot grid, patient form
    ├── confirmed.html  printable token slip
    ├── appointments.html
    └── not_found.html
```

## Clinic

Wellcrest, DHA Phase 4, Karachi — 021-3111 4400
Mon–Sat, 9:00 AM – 6:40 PM. Closed Sunday.
