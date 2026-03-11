# 🎓 Nexus Classroom

Nexus Classroom is a state-of-the-art, full-stack Virtual Classroom Platform designed to provide a premium and interactive learning experience. It combines high-performance video conferencing, real-time collaboration, and AI-powered educational insights.

## 🚀 Key Features

- **High-End Video Meetings**: Powered by **LiveKit WebRTC** for low-latency video and audio, featuring participant grid layouts and active speaker tracking.
- **Real-time Collaboration**: Instant messaging and hand-raising capabilities using **Socket.IO**.
- **AI Lecture Insights**: Intelligent analysis of meeting transcripts to provide summaries, key concepts, and action items.
- **Role-Based Access Control**: Separate, tailored dashboards and permissions for **Teachers** and **Students**.
- **Assignment Management**: Complete workflow for teachers to create assignments and students to submit files securely via **Supabase Storage**.
- **Advanced Analytics**: Interactive dashboards with data visualization using **Recharts**.
- **Premium Design**: A modern, dark-themed UI built with **React**, **Tailwind CSS**, and **Framer Motion**.

## 🛠️ Technology Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **LiveKit Client SDK** (Video Conferencing)
- **Socket.io Client** (Real-time Messaging)
- **Recharts** (Data Visualization)

### Backend
- **Node.js** & **Express**
- **TypeScript** (ESM)
- **PostgreSQL** (Database)
- **Supabase** (File Storage & Auth Utilities)
- **LiveKit Server SDK** (Token Management)
- **Socket.io** (Real-time Engine)

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (or a Supabase DB instance)
- **LiveKit Cloud** credentials (for video)
- **Supabase Project** (for storage)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MRvandals4vage/Lectra.git
   cd nexus-classroom
   ```

2. **Install Root & Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Configuration

You need to set up environment variables in both the root and the `server` directory.

#### Backend `.env` (`server/.env`)
Create a `.env` file in the `server` directory with the following:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env` (`.env`)
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL script found in `server/schema.sql` against your PostgreSQL database to create the necessary tables (`users`, `classes`, `assignments`, `submissions`, etc.).

## 🏃 Running Locally

To run both the frontend and the backend concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📁 Repository Structure

```text
├── server/               # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API Endpoints
│   │   ├── middleware/   # Auth & Validation
│   │   └── config/       # DB & Service configuration
│   └── schema.sql        # Database Schema
├── src/                  # React Frontend
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth context & providers
│   ├── lib/              # Utilities (Tailwind merge, etc.)
│   └── (Views)/          # Dashboard, MeetingRoom, LandingPage
└── package.json          # Root configuration & concurrent scripts
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
