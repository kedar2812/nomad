# nomad

> *linger. sip. work.*

**nomad** is a minimalist digital ledger for book cafes. it replaces the rusty old pen-and-paper register with a slick, responsive dashboard.

built because managing time shouldn't take time.

## 📁 project structure

```
nomad/
├── frontend/          # React + Vite frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── ...
└── backend/          # Backend API (placeholder)
    └── ...
```

## tech stack

### Frontend
- **react** (vite)
- **tailwind css** (visuals)
- **dexie.js** (offline-first local database)

### Backend
- *Coming soon* - Currently frontend-only with client-side storage

## 🎨 design system & theming

nomad uses a **semantic** color system to support automatic dark mode.
**do not use hardcoded colors** (e.g. `bg-white`, `text-black`).

### ✅ use these (safe)
| class | use case |
| :--- | :--- |
| `bg-primary` | main page background |
| `bg-secondary` | cards, modals, sidebars |
| `bg-tertiary` | inputs, subtle sections |
| `text-primary` | main headings, strong text |
| `text-secondary` | body text |
| `text-tertiary` | labels, metadata |
| `border-light` | default borders |

### ❌ avoid these (unsafe)
- `bg-white` (breaks in dark mode)
- `text-black` (invisible in dark mode)
- `bg-gray-100` (use `bg-tertiary` instead)

## 🚀 getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend

*Not yet implemented - see `backend/README.md` for planned features*

---

*made for those who wander.*
