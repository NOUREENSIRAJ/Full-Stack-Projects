# Luna & Spice
## Live Demo Link https://noureens.pythonanywhere.com/
Table reservation app for Luna & Spice — DHA Phase 8, Karachi.

Built with Flask and SQLite. Capacity is tracked per seating area per sitting,
so a room fills up instead of accepting an endless number of bookings.

## Screenshots

### Luna $ Spice home page
<img width="1870" height="889" alt="Screenshot 2026-08-31 190431" src="https://github.com/user-attachments/assets/234c3b9b-72cf-47ec-8057-31fade3905ea" />


### Reservation Confirmation Page
<img width="1870" height="889" alt="Screenshot 2026-08-31 190431" src="https://github.com/user-attachments/assets/0637aa06-a773-44ec-bed7-5ba61a900249" />



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
