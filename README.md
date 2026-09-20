# 🇮🇳 BharatQuest — Interactive Heritage & History Learning Platform

**BharatQuest** is a gamified, interactive Indian history, culture, and archaeology platform built with **React, TypeScript, Three.js, Supabase PostgreSQL, and Google Gemini 2.0 AI**.

---

## 🌟 Key Features

### 🏛️ 1. Archaeological Quest Quizzes
- **Topic Chronicles**: Ancient India (Indus Valley, Vedic Age), Medieval Dynasties, Freedom Movement, Cultural Heritage, and Geography.
- **Dynamic 3D Environments**: Three.js procedural visual backdrops (Ashoka Chakra, ancient ruins, Vedic shrines).
- **Anti-Cheat & Security**: Prevents copy-paste, inspection, and context menu actions during active quests.
- **Dynamic Scoring & XP**: Real-time XP rewards, accuracy percentages, and dynamic level tracking.

### 🤖 2. Google Gemini 2.0 AI Integration (BharatGuru)
- **AI Explanations on Wrong Answers**: Instant pedagogical explanations detailing why an answer is incorrect, accompanied by historical background and fun facts.
- **Adaptive AI Clues**: Contextual hints generated in real-time without spoiling the answers.
- **AI-Powered Study Plans**: Personalized 3-step improvement recommendations based on individual topic weakness analytics.
- **Rapid-Fire AI Generation**: Endless fresh multiple-choice questions dynamically crafted on the fly.

### 🎮 3. Heritage Arcade Arena (7 Mini-Games)
- **RapidFire**: 60-second high-speed blitz with dynamic Gemini-generated trivia.
- **CultureMatch**: Connect traditional Indian art forms, dances, and harvest festivals to their originating states.
- **TimeTravel**: Reconstruct India's historical timeline across ancient, medieval, and modern epochs in correct chronological order.
- **DecipherScript**: Ancient Indus and Sanskrit glyph deduction puzzle.
- **HeritageMemory**: Memory flip-match cards covering iconic Indian monuments.
- **ArtifactPuzzle**: Slide-and-snap puzzle restoring ancient excavated artifacts.
- **ChakraMaster**: Interactive meditation and trivia challenge centered around the 24 spokes of the Ashoka Chakra.

### 📊 4. Real Supabase Backend & Database Analytics
- **PostgreSQL Database**: Real persistence for user profiles, completed quests, question attempts, badges, and player levels.
- **Genuine User Leaderboard**: Dynamic ranking calculated directly from real player XP (zero fake/mock users).
- **Personalized Recommendations**: Evaluates user attempt history in Supabase to recommend targeted quests.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **3D Graphics & Animation**: Three.js, Canvas API, CSS3 Animations
- **AI Model**: Google Gemini 2.0 Flash (`@google/genai`)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row-Level Security)
- **Icons & Styling**: Custom CSS design system with Indian heritage aesthetics

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/BharatQuest.git
cd BharatQuest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 👥 Authors & Team
- **Project**: BharatQuest
- **Practical Submission**: Final Year / Semester Engineering Project
