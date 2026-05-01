# CodeArena

CodeArena is a LeetCode-style practice platform with two distinct roles:

- `admin` can create and publish multiple-choice questions
- `user` can browse published questions, answer them, and review explanations

This project is built with Next.js App Router and Supabase for data storage.

## Demo accounts

- Admin: `admin@codearena.dev` / `admin123`
- User: `student@codearena.dev` / `student123`

## Features

- Separate login flow with role-based redirects
- Admin dashboard for MCQ question-bank creation
- Student question list and individual answer pages
- Instant correct/incorrect feedback with the right answer and explanation
- Submission history per user with selected answer and result
- Mock test functionality with timed sessions
- Seeded demo data created automatically

## Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor to create the required tables
4. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000).

## Database Schema

The application uses the following tables in Supabase:
- `users` - User accounts
- `questions` - MCQ questions
- `sessions` - User sessions
- `submissions` - Question submissions
- `password_resets` - Password reset tokens
- `mock_sessions` - Mock test sessions
- `mock_results` - Mock test results

## Notes

- The database is now Supabase-backed instead of file-backed
- Demo data is seeded automatically on first run
