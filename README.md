# QuizStreak

QuizStreak is a premium, professional educational platform built with Next.js 15. It allows users to solve one daily coding/aptitude challenge, build streaks, earn points, and climb global leaderboards.

## Features

- **Daily Challenges:** One curated challenge every day across various categories (JavaScript, SQL, AWS, Aptitude, etc.).
- **Streak Tracking:** Build consistency and earn bonus multipliers.
- **Leaderboards:** Compete with others globally (Weekly, Monthly, All Time).
- **Badges:** Unlock achievements as you progress.
- **Google OAuth:** Seamless authentication.
- **Responsive Design:** Mobile-first, premium glassmorphism UI.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Animations:** Framer Motion
- **Database:** MongoDB Atlas
- **Auth:** NextAuth.js v5
- **API:** Google Sheets API (for question management)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Cloud Project (for OAuth and Sheets API)

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your credentials.
4. Run the development server:
   ```bash
   npm run dev
   ```

### Google Sheet Structure

The app expects a Google Sheet with the following columns:
`Day, Date, Category, Difficulty, Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation`

## License

MIT
