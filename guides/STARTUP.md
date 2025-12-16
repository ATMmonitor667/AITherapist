# EchoScape: How to Run

To run the full EchoScape stack, you need to start 3 separate terminals.

## Prerequisites

1. **Database**: Make sure you have Supabase set up with the schema from `backend/database/schema.sql`
2. **Environment Variables**: Copy `.env.example` to `.env` in the backend folder and fill in:
   - `GEMINI_API_KEY` - Google Gemini API key
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon key
   - `FAL_API_KEY` (optional) - For image generation, falls back to Unsplash placeholders

---

### 1. ML Microservice (Python)
This powers the emotion intelligence.
```bash
cd ml-service
./venv/Scripts/python.exe main.py
```
*Expected Output:* `Uvicorn running on http://0.0.0.0:8000`

### 2. Backend API (Node.js)
This manages data and the API.
```bash
cd backend
npm run dev
```
*Expected Output:* `🚀 Server running on port 4000`

### 3. Frontend (Next.js)
The visual interface.
```bash
cd fibo-emotion-studio
npm run dev -- -p 3005
```
*Expected Output:* `Ready in ... ms` -> Open [http://localhost:3005](http://localhost:3005)

---

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Welcome/Landing** | http://localhost:3005/welcome | Landing page with disclaimer |
| **Main App** | http://localhost:3005 | Chat + Visual interface |
| **Galaxy View** | http://localhost:3005/galaxy | 3D session history |
| **API Health** | http://localhost:4000/api/health | Backend status |
| **ML Health** | http://localhost:8000/health | ML service status |

---

## Key Features

- ✅ **Chat Interface**: Reflective conversation with Echo AI
- ✅ **Emotion Analysis**: Real-time emotion detection (ML + Gemini hybrid)
- ✅ **Visual Generation**: AI-generated emotional landscapes
- ✅ **Reframe Sliders**: Hope & Intensity adjustments
- ✅ **Crisis Detection**: Safety features with resources
- ✅ **Galaxy View**: 3D visualization of session history

---

## Database Migration

If you're updating from an older version, run this SQL in Supabase:

```sql
-- Add new columns to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS original_image_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reframed_image_url TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS crisis_detected BOOLEAN DEFAULT FALSE;
```
