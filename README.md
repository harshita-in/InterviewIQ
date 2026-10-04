# InterviewIQ – AI-Based Mock Interview and Performance Analyzer

![InterviewIQ Banner](https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80)

> **An Intelligent Full-Stack AI Platform for Automated Mock Interviews, Speech NLP Analysis & Placement Evaluation**

---


## 📌 Introduction & Problem Statement
Many students have strong academic knowledge but struggle to perform well in interviews due to limited practical experience, lack of instant feedback, and interview anxiety. 

**InterviewIQ** is an Artificial Intelligence-powered interview preparation platform designed to help candidates prepare for real-world placement drives. The platform simulates both technical and HR interviews, formulates questions tailored directly to the candidate's resume, listens and transcribes verbal answers in real time, and evaluates performance using NLP metrics and LLMs.

---

## 🚀 Key Highlights & Features

- **📄 Resume-Based Question Generation:** Upload any PDF/Text resume. The system automatically extracts technical skills, frameworks, and projects to dynamically adapt questions.
- **🎙️ Real-Time Voice & Speech Processing:** 
  - **Text-to-Speech (TTS):** The AI interviewer avatar speaks questions aloud.
  - **Speech-to-Text (STT):** Candidates can verbally answer questions using real-time speech recognition.
  - **Speech NLP Analysis:** Tracks words-per-minute (WPM), speech hesitation, and subconscious filler words (`um`, `uh`, `like`, `basically`).
- **📹 Webcam Feed & Presence Tracking:** Candidates practice with live video preview simulating real remote video interviews.
- **📊 Comprehensive AI Evaluation & Scoring:**
  - Technical Accuracy & Depth Score (0-100%)
  - Communication Clarity & Structure Score (0-100%)
  - Confidence & Fluency Score (0-100%)
  - Model Gold-Standard Benchmark Answers for every question.
- **📈 Candidate Performance Dashboard:** Historical score tracking, placement readiness badges (`Placement Ready` / `Needs Practice`), and downloadable scorecards.
- **🛡️ Interviewer & Recruiter Dashboard:** Batch performance tracking, candidate rosters, and cohort analytics.

---

## 🏗️ System Architecture & Workflow

```
[Candidate Input]
  │── Register / Login
  │── Upload Resume (PDF / Text)
  │── Choose Role (SDE, ML, Frontend, Data Science) & Round (Tech / HR / Mix)
  ▼
[AI Interview Engine]
  │── Dynamic Question Generator (LLM / Curated Fallback Bank)
  │── AI Avatar Voice (SpeechSynthesis)
  │── Speech-to-Text Transcription (Web Speech API)
  ▼
[NLP & Evaluation Module]
  │── Technical Concept Overlap & Depth Analysis
  │── Filler Word & Speech Cadence Analysis (WPM, Sentiment)
  │── Score Aggregation (Technical, Communication, Confidence)
  ▼
[Results & Scorecard]
  │── Executive Summary
  │── Strengths & Weaknesses Breakdown
  │── Actionable Recommendations & Model Benchmark Answers
  │── Print / Export to PDF
  ▼
[Interviewer / Admin Dashboard]
  └── Cohort Analytics, Batch Readiness, Candidate Records
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend API** | Python 3.12, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Database** | SQLite (Zero-configuration file database) |
| **AI / NLP** | Speech Recognition (Web Speech API), NLP Heuristics, Groq / Llama 3 API integration support |
| **Resume Extraction** | `pypdf` for automated PDF text & skill parsing |
| **Authentication** | JWT (JSON Web Tokens), PBKDF2/Bcrypt password security |

---

## 📁 Repository Structure

```
InterviewIQ/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration & settings
│   │   ├── database.py            # SQLite engine & session management
│   │   ├── models.py              # Database models (User, Resume, Session, Question)
│   │   ├── schemas.py             # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── resume_parser.py   # PDF text extraction & skill parsing
│   │   │   ├── speech_nlp.py      # Speech cadence, WPM, and filler analysis
│   │   │   └── interview_ai.py    # Question generation & evaluation engine
│   │   ├── routes/
│   │   │   ├── auth.py            # Login, registration, and tokens
│   │   │   ├── resume.py          # Resume upload & profile analysis
│   │   │   ├── interviews.py      # Interview session lifecycle & answers
│   │   │   └── admin.py           # Recruiter & admin cohort analytics
│   │   └── main.py                # FastAPI entrypoint & seed data
│   ├── requirements.txt           # Python backend dependencies
│   └── run.py                     # Uvicorn startup script
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, WebcamPreview
│   │   ├── pages/                 # Home, SetupInterview, LiveInterview, ReportDetails, CandidateDashboard, AdminDashboard
│   │   ├── utils/                 # api.js, speech.js
│   │   ├── App.jsx                # Router & layout
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
├── setup.bat                      # One-click environment installer
├── start.bat                      # One-click local launcher
└── README.md
```

---

## ⚡ Quick Start Guide

### Option 1: One-Click Startup (Recommended for Windows)
1. Double-click `start.bat` in the root directory.
2. The script will automatically start the FastAPI backend on `http://localhost:8000` and Vite frontend on `http://localhost:5173`, and open the application in your browser.

---

### Option 2: Manual Terminal Execution

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
> Backend API will be live at `http://localhost:8000`. Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

#### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
> Frontend will be live at `http://localhost:5173`.

---

## 🔮 Future Scope
- **Real-Time Facial Expression Analysis:** Integrating computer vision models for eye contact, stress levels, and emotional composure detection.
- **Multi-Lingual Support:** Supporting regional languages to make interview practice accessible to non-native English speakers.
- **Job Portal Integration:** Direct synchronization with campus placement portals and corporate applicant tracking systems (ATS).
- **Mobile Native Application:** Flutter or React Native mobile client for on-the-go practice sessions.
