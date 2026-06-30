# HemoLens Backend

AI-powered blood report analysis API built with Node.js, Express, MongoDB, and Claude.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGODB_URI` — from [MongoDB Atlas](https://cloud.mongodb.com) (free tier)
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -base64 32`)
- `GEMINI_API_KEY — from https://aistudio.google.com/app/apikey (100% free)

### 3. Start the server
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, get JWT token |
| GET | `/api/auth/me` | Get current user (requires token) |

### Reports
All report endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/upload` | Upload blood report (multipart/form-data, field name: `report`) |
| GET | `/api/reports/status/:id` | Poll analysis status |
| GET | `/api/reports/:id` | Get full analysis |
| GET | `/api/reports/history` | All reports for user |
| POST | `/api/reports/:id/chat` | Ask a question about a report |
| DELETE | `/api/reports/:id` | Delete a report |

### Example: Upload a report
```bash
curl -X POST http://localhost:5000/api/reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "report=@/path/to/blood_report.pdf"
```

### Example: Chat about a report
```bash
curl -X POST http://localhost:5000/api/reports/REPORT_ID/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What does my low hemoglobin mean?"}'
```

---

## Project Structure
```
hemolens-backend/
├── server.js              # Entry point
├── .env.example           # Environment variable template
├── config/                # (for future DB config helpers)
├── controllers/
│   ├── authController.js  # Register / login logic
│   └── reportController.js # Upload / analyze / fetch reports
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── upload.js          # Multer file handling
│   └── errorHandler.js    # Global error handling
├── models/
│   ├── User.js            # User schema
│   └── Report.js          # Report + biomarker schema
├── routes/
│   ├── auth.js            # Auth route definitions
│   └── reports.js         # Report route definitions
└── services/
    ├── claudeService.js   # Claude API integration
    └── extractionService.js # PDF + OCR text extraction
```
