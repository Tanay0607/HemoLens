# HemoLens Frontend

React + Vite frontend for HemoLens AI blood report analysis.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (make sure backend is running on port 5000)
npm run dev
```

Opens at http://localhost:5173

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Report history + stats |
| `/upload` | Drag-and-drop upload with live progress |
| `/report/:id` | Full analysis — biomarker cards, chart, AI chat |

## Project Structure

```
src/
├── App.jsx               # Routes + auth guards
├── main.jsx              # React + providers setup
├── index.css             # Tailwind + component classes
├── services/
│   └── api.js            # All axios API calls
├── hooks/
│   └── useAuth.jsx       # Auth context (login/register/logout)
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx # Report history
│   ├── UploadPage.jsx    # File upload with polling
│   └── ReportPage.jsx    # Analysis + AI chat
└── components/
    └── shared/
        └── Navbar.jsx
```

## Key Features
- Drag-and-drop upload (PDF / JPG / PNG / WEBP)
- Real-time polling during AI analysis with stage indicators
- Biomarker cards with color-coded flags (tap to expand explanation)
- Category filter (CBC, Liver, Thyroid, etc.)
- Horizontal bar chart of biomarker values
- Inline AI chat powered by Claude
