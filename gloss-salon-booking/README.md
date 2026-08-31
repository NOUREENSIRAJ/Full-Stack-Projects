# Gloss — Salon Chair Booking

A salon appointment booking app built with Flask. Clients pick a treatment,
choose a stylist and a time, and the app makes sure no chair gets
double-booked.

The interesting part is that slots are **duration-aware**. A 30-minute brow
shaping and a 3-hour balayage don't take the same space in the day, so the app
works on a half-hour grid and blocks every slot a treatment actually consumes.
A 150-minute colour booked at 12:00 takes five consecutive slots on that
stylist's chair, and 12:30 through 14:00 disappear from everyone else's
options. Times too close to closing are greyed out automatically, because a
3-hour service starting at 17:00 would run past 19:00.

## Screenshots

The service menu — every treatment shows its price and how long it takes.

![The service menu] <img width="1868" height="898" alt="Screenshot" src="https://github.com/user-attachments/assets/4ebd5ecc-2379-47b1-822c-a3936416405c" />


Confirmation after booking, with the reference, the chair, and the time held.

![Booking confirmation] <img width="1845" height="882" alt="Screenshot png1" src="https://github.com/user-attachments/assets/3b4ae28c-9e99-4a7f-9932-b67ab77e25a8" />


## Built with

- **Python 3** and **Flask** — routing, form handling, request validation
- **SQLite** — bookings stored in `gloss.db`, created automatically on first run
- **Jinja2** — server-side templating with template inheritance and custom filters
- **HTML5 / CSS3** — hand-written, no framework

## Features

- Eight services across three categories, each with its own price and duration
- Four stylists, each qualified for a specific set of services
- Availability calculated per stylist, per day, per treatment length
- Server-side validation on name, mobile number, and slot availability
- A diary view of all upcoming appointments, with cancellation
- Booking references generated per month (`GL2608001`)
- Closed Mondays — the day picker skips them

## Running it locally

```bash
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5002

The database is created on first run. No setup needed.

## How it's organised

```
gloss-salon-booking/
├── app.py              # routes, salon data, availability logic
├── requirements.txt
├── static/
│   └── style.css
└── templates/
    ├── base.html       # shared layout
    ├── index.html      # service menu and team
    ├── book.html       # stylist, day, time and details
    ├── booked.html     # confirmation
    ├── diary.html      # all appointments
    └── not_found.html
```

Services and stylists are defined as dictionaries at the top of `app.py`, so
adding a treatment or a new stylist means editing one place — prices,
durations, and who does what all flow from there.

## Notes

`app.py` runs with Flask's development server, which is fine for local use but
not for production. The secret key falls back to a development default and
should be set through the `SECRET_KEY` environment variable if this is ever
deployed.
