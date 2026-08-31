# Luna & Spice

Table reservation app for Luna & Spice — DHA Phase 8, Karachi.

Built with Flask and SQLite. Capacity is tracked per seating area per sitting,
so a room fills up instead of accepting an endless number of bookings.

## Screenshots

### The Rooms 
<img width="1870" height="888" alt="Screenshot PNGG" src="https://github.com/user-attachments/assets/2ebee25e-ba49-40b9-b983-019925d8ff09" />
### Booking confirmation
<img width="1856" height="881" alt="Screenshot PNG2" src="https://github.com/user-attachments/assets/a4bdd55c-0770-43cb-a433-0cba4be54f61" />

## Seating areas

| Area           | Covers | Max party | Notes                        |
|----------------|--------|-----------|------------------------------|
| Dining room    | 38     | 8         | A la carte                   |
| Garden terrace | 24     | 10        | Open air, heaters after dark |
| Chef's counter | 8      | 4         | Tasting menu only            |

## Running locally

```bash
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5003

The database (`luna_spice.db`) is created automatically on first run.

## Routes

- `/` — the rooms and menu notes
- `/reserve` — pick an area, day and sitting, then book
- `/reserved/<ref>` — confirmation page for a booking reference
- `/book` — tonight's book: every reservation, with cancel buttons

## Before deploying

- Replace `app.secret_key` in `app.py` with a real secret, loaded from an
  environment variable rather than hardcoded.
- Turn off `debug=True` in `app.run()`.
- `/book` is currently open to anyone — put it behind a login before the app
  is reachable from the internet.
