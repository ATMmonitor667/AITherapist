# EchoScape

**AI-Powered Emotional Reflection & Visual Companion**

EchoScape is an innovative mental wellness application that combines conversational AI therapy with visual metaphor generation. Users engage in reflective conversations with an AI companion that analyzes their emotions and generates personalized visual landscapes using the FIBO (Feelings Into Beautiful Objects) framework.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [FIBO Integration](#fibo-integration)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Example Outputs](#example-outputs)
- [Troubleshooting](#troubleshooting)

---

## Features

- **AI Conversation Therapy**: Engage in empathetic conversations with an OpenAI-powered assistant
- **Emotion Analysis**: Real-time emotion detection and tracking throughout conversations
- **Visual Metaphor Generation**: Transform emotions into beautiful landscape imagery using FIBO
- **Crisis Detection**: Automatic detection of crisis keywords with resource recommendations
- **Session Management**: Save and review past reflection sessions
- **Secure Authentication**: Supabase-powered user authentication and session management
- **Responsive UI**: Beautiful, modern interface built with Next.js and Tailwind CSS

---

## Architecture Overview

EchoScape follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth UI    │  │   Chat UI    │  │  Visual UI   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Zustand State Management                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                    Axios HTTP Client
                          │
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│        Express.js + TypeScript + Node.js                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Session    │  │ Conversation │  │    Visual    │     │
│  │  Controller  │  │  Controller  │  │  Controller  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Session    │  │     AI       │  │    FIBO      │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼────────┐    ┌──────────▼─────────┐
    │   Supabase DB    │    │   OpenAI API       │
    │   PostgreSQL     │    │   GPT-4            │
    └──────────────────┘    └────────────────────┘
```

### Frontend Architecture

**Location**: `/fibo-emotion-studio`

The frontend is built with Next.js 16 using the App Router and React 19. It follows a component-based architecture with centralized state management.

**Key Components**:
- `AuthProvider.tsx` - Handles authentication state initialization
- `ChatPanel.tsx` - Main chat interface
- `MessageBubble.tsx` - Individual message display
- `EmotionCard.tsx` - Displays emotion analysis results
- `VisualLandscape.tsx` - Shows generated imagery

**State Management** (Zustand):
- `useAuthStore.ts` - Authentication state (user, session, login/logout)
- `useSessionStore.ts` - Chat session state (messages, emotions, images)

**API Layer**:
- `lib/api.ts` - Axios-based API client with authentication interceptors

### Backend Architecture

**Location**: `/backend`

The backend is built with Express.js and TypeScript, following a layered architecture pattern.

**Layers**:
1. **Routes** (`src/routes/`) - HTTP endpoint definitions
2. **Controllers** (`src/controllers/`) - Request/response handling
3. **Services** (`src/services/`) - Business logic
4. **Middleware** (`src/middleware/`) - Authentication, error handling

**Key Services**:
- `session.service.ts` - Session CRUD operations
- `conversation.service.ts` - AI conversation logic
- `visual.service.ts` - FIBO image generation
- `emotion.service.ts` - Emotion analysis
- `crisis.service.ts` - Crisis detection

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand 5.0.9
- **HTTP Client**: Axios 1.13.2
- **Authentication**: Supabase SSR
- **Animations**: Framer Motion 12.23.25
- **3D Graphics**: Three.js + React Three Fiber

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.1
- **Language**: TypeScript
- **Database Client**: @supabase/supabase-js 2.86.2
- **AI**: OpenAI API (GPT-4)
- **Image Generation**: Fal.ai API
- **Authentication**: JWT via Supabase
- **Development**: tsx (TypeScript execution)

### Database
- **Platform**: Supabase (PostgreSQL 15+)
- **ORM**: Direct SQL via Supabase client
- **Authentication**: Supabase Auth (JWT)

---

## FIBO Integration

**FIBO** (Feelings Into Beautiful Objects) is our proprietary framework for translating emotional states into visual parameters that generate meaningful landscape imagery.

### How FIBO Works

1. **Emotion Analysis**: User messages are analyzed for emotional content
2. **Parameter Mapping**: Emotions are mapped to visual parameters:
   - **Lighting**: Intensity, color temperature, direction
   - **Composition**: Openness, depth, focal point
   - **Palette**: Mood-based color schemes
   - **Elements**: Scene objects (trees, water, sky, etc.)

3. **JSON Generation**: Visual parameters are structured into FIBO JSON
4. **Prompt Construction**: FIBO JSON is converted to image generation prompts
5. **Image Generation**: Fal.ai API generates the landscape

### FIBO JSON Structure

```typescript
interface FiboJson {
  prompt: string;              // Base scene description
  lighting: {
    intensity: number;         // 0-1 (dim to bright)
    color: 'warm' | 'cool';   // Color temperature
    direction: string;         // Light source direction
  };
  composition: {
    openness: number;          // 0-1 (enclosed to vast)
    depth: number;             // 0-1 (shallow to deep)
    focal_point: string;       // Center of attention
  };
  palette: {
    mood: string;              // Overall color mood
    dominant_colors: string[]; // Primary colors
    accents: string[];         // Accent colors
  };
  elements: string[];          // Scene elements
}
```

### FIBO Service Implementation

**Location**: `backend/src/services/visual.service.ts`

```typescript
// Build FIBO JSON from emotion data
buildFiboJson(visualParams: VisualParams, metaphor: string): FiboJson {
  return {
    prompt: metaphor,
    lighting: {
      intensity: visualParams.brightness || 0.7,
      color: visualParams.warmth > 0.5 ? 'warm' : 'cool',
      direction: 'overhead'
    },
    composition: {
      openness: visualParams.openness || 0.6,
      depth: visualParams.depth || 0.7,
      focal_point: 'center'
    },
    palette: {
      mood: visualParams.mood || 'serene',
      dominant_colors: visualParams.colors || ['green', 'blue'],
      accents: ['gold', 'amber']
    },
    elements: visualParams.elements || ['forest', 'path', 'light']
  };
}

// Convert FIBO JSON to image generation prompt
fiboJsonToPrompt(fiboJson: FiboJson): string {
  const lightDesc = fiboJson.lighting.intensity > 0.6 
    ? 'bright, well-lit' 
    : 'dim, atmospheric';
  const colorDesc = fiboJson.lighting.color === 'warm' 
    ? 'warm golden tones' 
    : 'cool blue tones';
  const openDesc = fiboJson.composition.openness > 0.5 
    ? 'vast, expansive' 
    : 'intimate, enclosed';

  return `${fiboJson.prompt}. ${lightDesc}, ${colorDesc}, ${openDesc}. 
          Cinematic, photorealistic, 8k, highly detailed.`;
}
```

### Emotion-to-Visual Mapping

| Emotion | Lighting | Openness | Colors | Elements |
|---------|----------|----------|--------|----------|
| **Joy** | Bright (0.8) | Open (0.8) | Warm yellows, oranges | Sunlight, open fields |
| **Calm** | Soft (0.6) | Moderate (0.5) | Blues, greens | Water, trees, sky |
| **Sadness** | Dim (0.3) | Enclosed (0.3) | Grays, deep blues | Rain, fog, shadows |
| **Anxiety** | Harsh (0.7) | Confined (0.2) | Sharp contrasts | Narrow paths, dense forest |
| **Hope** | Rising (0.7) | Expanding (0.7) | Pastels, golds | Dawn, horizon, light |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Fal.ai API key (optional, for image generation)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-The-rapist-dummycomplete
```

### 2. Database Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

#### Run Database Schema

1. Open Supabase SQL Editor
2. Run the schema from `guides/supabase_setup.sql`
3. Run the NULL constraint fixes:

```sql
ALTER TABLE sessions 
  ALTER COLUMN emotion_data DROP NOT NULL,
  ALTER COLUMN visual_params DROP NOT NULL,
  ALTER COLUMN original_image_url DROP NOT NULL;
```

#### Enable Authentication

1. In Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Disable email confirmation for development (optional)

### 3. Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-key

# Fal.ai (optional)
FAL_KEY=your-fal-key

# Server
PORT=4000
NODE_ENV=development
```

#### Start Backend:

```bash
npm run dev
```

Backend will run on `http://localhost:4000`

### 4. Frontend Setup

```bash
cd fibo-emotion-studio
npm install
```

#### Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

#### Start Frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Create Test User

1. Go to `http://localhost:3000/signup`
2. Create an account with email/password
3. Login and start chatting!

---

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication

All API requests (except health check) require a JWT token in the Authorization header:

```http
Authorization: Bearer <supabase-jwt-token>
```

### Endpoints

#### 1. Start Session

**POST** `/session/start`

Creates a new chat session for the authenticated user.

**Headers**:
```http
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "created_at": "2024-12-15T20:00:00Z",
    "updated_at": "2024-12-15T20:00:00Z",
    "emotion_data": null,
    "visual_params": null,
    "original_image_url": null,
    "crisis_detected": false
  },
  "timestamp": "2024-12-15T20:00:00Z"
}
```

#### 2. Send Message

**POST** `/session/:sessionId/message`

Sends a message and receives AI response with emotion analysis.

**Headers**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "content": "I'm feeling overwhelmed with work today"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "session_id": "uuid",
      "role": "user",
      "content": "I'm feeling overwhelmed with work today",
      "emotion_snapshot": {
        "stress": 0.8,
        "anxiety": 0.6,
        "overwhelm": 0.9
      },
      "created_at": "2024-12-15T20:00:00Z"
    },
    "aiMessage": {
      "id": "uuid",
      "session_id": "uuid",
      "role": "assistant",
      "content": "I hear you. Feeling overwhelmed is completely valid...",
      "created_at": "2024-12-15T20:00:01Z"
    },
    "emotionData": {
      "stress": 0.8,
      "anxiety": 0.6,
      "overwhelm": 0.9
    },
    "crisisDetected": false
  }
}
```

#### 3. Get Session History

**GET** `/session/:sessionId/history`

Retrieves all messages from a session.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Hello",
      "created_at": "2024-12-15T20:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Hi! How are you feeling today?",
      "created_at": "2024-12-15T20:00:01Z"
    }
  ]
}
```

#### 4. Generate Visual

**POST** `/visual/generate`

Generates a FIBO-based visual landscape from session emotions.

**Request Body**:
```json
{
  "session_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "image_url": "https://fal.media/files/...",
    "visual_params": {
      "brightness": 0.7,
      "warmth": 0.6,
      "openness": 0.8,
      "mood": "hopeful"
    },
    "fibo_json": {
      "prompt": "A peaceful forest path bathed in golden light",
      "lighting": { "intensity": 0.7, "color": "warm" },
      "composition": { "openness": 0.8, "depth": 0.7 },
      "palette": { "mood": "hopeful", "dominant_colors": ["green", "gold"] }
    }
  }
}
```

### Frontend API Integration

**Location**: `fibo-emotion-studio/src/lib/api.ts`

```typescript
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[API] Session error:', error);
    return Promise.reject(new Error('Authentication error'));
  }

  if (!session?.access_token) {
    console.warn('[API] No auth token available');
    return Promise.reject(new Error('Not authenticated'));
  }

  config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});

export const echoApi = {
  // Start a new session
  startSession: async (): Promise<Session> => {
    const response = await api.post('/session/start');
    return response.data.data;
  },

  // Send a message
  sendMessage: async (sessionId: string, content: string) => {
    const response = await api.post(`/session/${sessionId}/message`, { content });
    return response.data.data;
  },

  // Get history
  getHistory: async (sessionId: string): Promise<Message[]> => {
    const response = await api.get(`/session/${sessionId}/history`);
    return response.data.data;
  },
};
```

---

## Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `sessions`
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Content
  journal_text TEXT,
  summary TEXT,
  themes TEXT[],
  metaphor TEXT,
  
  -- Emotions
  emotion_data JSONB,
  primary_emotion TEXT,
  
  -- Visuals
  visual_params JSONB,
  original_image_url TEXT,
  reframed_image_url TEXT,
  reframe_params JSONB,
  
  -- Safety
  crisis_detected BOOLEAN DEFAULT FALSE
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  emotion_snapshot JSONB,
  patterns_detected TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Relationships

```
users (1) ──< (many) sessions
sessions (1) ──< (many) messages
```

---

## Example Outputs

### Chat Conversation

```
User: I've been feeling really stressed about my upcoming presentation

AI: I hear you. Presentation anxiety is completely normal and shows that 
you care about doing well. What specifically about the presentation is 
causing you the most stress?

User: I'm worried I'll forget what to say and embarrass myself

AI: That fear of forgetting is very common. Let's work through this 
together. Have you considered using note cards or practicing with a 
friend? Sometimes rehearsing out loud can build confidence
```

### Emotion Analysis Output

```json
{
  "anxiety": 0.75,
  "stress": 0.80,
  "fear": 0.60,
  "hope": 0.30,
  "primary_emotion": "anxiety"
}
```

### FIBO Visual Generation

**Input Emotions**: Anxiety (0.75), Stress (0.80)

**Generated FIBO JSON**:
```json
{
  "prompt": "A narrow forest path shrouded in mist, with dappled light filtering through dense canopy",
  "lighting": {
    "intensity": 0.4,
    "color": "cool",
    "direction": "filtered"
  },
  "composition": {
    "openness": 0.3,
    "depth": 0.6,
    "focal_point": "path ahead"
  },
  "palette": {
    "mood": "tense",
    "dominant_colors": ["deep green", "gray", "muted blue"],
    "accents": ["silver", "pale yellow"]
  },
  "elements": ["dense forest", "narrow path", "mist", "filtered light"]
}
```

**Generated Image**: A photorealistic forest scene with enclosed feeling, cool tones, and atmospheric lighting that visually represents the user's anxious emotional state.

---

## Troubleshooting

### Common Issues

#### 1. 401 Unauthorized Errors

**Problem**: API requests return 401 errors

**Solutions**:
- Verify Supabase credentials in `.env` files
- Check that `SUPABASE_SERVICE_KEY` is set in backend
- Ensure user is logged in on frontend
- Clear browser localStorage and re-login

#### 2. Database Constraint Violations

**Problem**: `null value in column "X" violates not-null constraint`

**Solution**: Run the NULL constraint fixes:
```sql
ALTER TABLE sessions 
  ALTER COLUMN emotion_data DROP NOT NULL,
  ALTER COLUMN visual_params DROP NOT NULL,
  ALTER COLUMN original_image_url DROP NOT NULL;
```

#### 3. CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**: Verify backend CORS configuration in `src/server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### 4. Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use the predev script (already configured)
npm run dev
```

#### 5. AI Not Responding

**Problem**: Messages send but no AI response

**Solutions**:
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota/billing
- Review backend logs for errors
- Ensure request body uses `content` not `text`

---

## License

MIT License - See LICENSE file for details

---

## Contributors

Sujana Yeasmin & Rahat Hossain (ATM)

---

## Acknowledgments

- OpenAI for GPT-4 API
- Supabase for database and authentication
- Fal.ai for image generation
- Next.js and React teams
- The open-source community

---

**Built with for mental wellness and emotional reflection**
