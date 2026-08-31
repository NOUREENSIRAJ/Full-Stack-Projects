/* Gloss â€” static salon booking.
   Same rules as the Flask version: duration-aware slots, one chair per
   stylist, nothing double-books. Bookings live in this browser only. */

/* --- Salon data ------------------------------------------------------- */

const SERVICES = {
  "cut-blowdry": {
    id: "cut-blowdry",
    name: "Cut & blow-dry",
    group: "Hair",
    minutes: 60,
    price: 1400,
    blurb: "Consultation, wash, precision cut, finished with a smooth blow-dry.",
  },
  "gloss-colour": {
    id: "gloss-colour",
    name: "Full colour & gloss",
    group: "Hair",
    minutes: 150,
    price: 4200,
    blurb: "Root-to-tip colour with a shine gloss sealed in at the basin.",
  },
  balayage: {
    id: "balayage",
    name: "Balayage",
    group: "Hair",
    minutes: 180,
    price: 5600,
    blurb: "Hand-painted lightening, toned to your base and blow-dried out.",
  },
  keratin: {
    id: "keratin",
    name: "Keratin smoothing",
    group: "Hair",
    minutes: 120,
    price: 4800,
    blurb: "Frizz treatment that holds for eight to twelve weeks.",
  },
  facial: {
    id: "facial",
    name: "Deep-clean facial",
    group: "Skin",
    minutes: 60,
    price: 2200,
    blurb: "Steam, extraction, mask and massage for congested skin.",
  },
  threading: {
    id: "threading",
    name: "Brow shaping",
    group: "Skin",
    minutes: 30,
    price: 350,
    blurb: "Threaded and mapped to your face, tinted on request.",
  },
  "gel-mani": {
    id: "gel-mani",
    name: "Gel manicure",
    group: "Nails",
    minutes: 60,
    price: 1200,
    blurb: "Shaped, cuticle work, and a gel colour cured to last three weeks.",
  },
  pedi: {
    id: "pedi",
    name: "Spa pedicure",
    group: "Nails",
    minutes: 90,
    price: 1800,
    blurb: "Soak, scrub, callus work and a leg massage. Polish optional.",
  },
};

const GROUP_ORDER = ["Hair", "Skin", "Nails"];

const STYLISTS = {
  noureen: {
    id: "noureen",
    name: "Noureen",
    initials: "N",
    title: "Creative director",
    does: ["cut-blowdry", "gloss-colour", "balayage", "keratin"],
    bio: "Fifteen years behind the chair. Curls, fringes and warm blondes.",
  },
  ariba: {
    id: "ariba",
    name: "Ariba",
    initials: "A",
    title: "Senior stylist",
    does: ["cut-blowdry", "gloss-colour", "keratin"],
    bio: "Sharp bobs and low-maintenance colour that grows out cleanly.",
  },
  hira: {
    id: "hira",
    name: "Hira",
    initials: "H",
    title: "Skin therapist",
    does: ["facial", "threading"],
    bio: "Trained in acne and pigmentation care. Very gentle hands.",
  },
  zainab: {
    id: "zainab",
    name: "Zainab",
    initials: "Z",
    title: "Nail artist",
    does: ["gel-mani", "pedi", "threading"],
    bio: "Freehand art, chrome finishes, and the neatest cuticle work here.",
  },
};

const OPEN_HOUR = 10;
const CLOSE_HOUR = 19;
const STEP = 30;

const SLOTS = (function () {
  const out = [];
  for (let m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += STEP) {
    out.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
  }
  return out;
})();

/* --- Formatting ------------------------------------------------------- */

function pkr(amount) {
  return "PKR " + Number(amount).toLocaleString("en-US");
}

function asHours(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return h + " hr " + m + " min";
  if (h) return h + " hr";
  return m + " min";
}

function isoDate(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function fromIso(iso) {
  const p = iso.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

function prettyDate(iso) {
  return fromIso(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* --- Stored bookings -------------------------------------------------- */

const STORE_KEY = "gloss.bookings";

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveBookings(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

function makeRef() {
  const n = loadBookings().length + 1;
  const now = new Date();
  const stamp =
    String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0");
  return "GL" + stamp + String(n).padStart(3, "0");
}

/* --- Availability ----------------------------------------------------- */

function salonDays(count) {
  count = count || 7;
  const days = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (cursor.getDay() !== 1) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function blockedSlots(stylistId, day) {
  const taken = new Set();
  loadBookings().forEach(function (b) {
    if (b.stylist_id !== stylistId || b.slot_date !== day) return;
    const start = SLOTS.indexOf(b.start_time);
    if (start === -1) return;
    const span = Math.max(1, Math.floor(b.minutes / STEP));
    for (let i = start; i < start + span && i < SLOTS.length; i++) taken.add(SLOTS[i]);
  });
  return taken;
}

function openStarts(stylistId, day, minutes) {
  const need = Math.max(1, Math.floor(minutes / STEP));
  const taken = blockedSlots(stylistId, day);
  return SLOTS.map(function (t, i) {
    const window = SLOTS.slice(i, i + need);
    const fits = window.length === need && !window.some(function (w) { return taken.has(w); });
    return { time: t, open: fits };
  });
}

function endTime(start, minutes) {
  const p = start.split(":").map(Number);
  const total = p[0] * 60 + p[1] + minutes;
  return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}

/* --- Flash messages --------------------------------------------------- */

function setFlash(msg, cat) {
  try {
    sessionStorage.setItem("gloss.flash", JSON.stringify([{ msg: msg, cat: cat || "ok" }]));
  } catch (e) {}
}

function takeFlash() {
  try {
    const raw = sessionStorage.getItem("gloss.flash");
    sessionStorage.removeItem("gloss.flash");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function renderFlash(list) {
  const host = document.getElementById("flash");
  if (!host) return;
  if (!list || !list.length) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML =
    '<ul class="notes">' +
    list
      .map(function (f) {
        return '<li class="note note--' + esc(f.cat) + '">' + esc(f.msg) + "</li>";
      })
      .join("") +
    "</ul>";
}

function param(name) {
  return new URLSearchParams(window.location.search).get(name);
}

