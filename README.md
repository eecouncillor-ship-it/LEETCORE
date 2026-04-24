# CodeArena

CodeArena is a LeetCode-style practice platform with two distinct roles:

- `admin` can create and publish multiple-choice questions
- `user` can browse published questions, answer them, and review explanations

This project is built with Next.js App Router and a lightweight file-backed data store, so it can run locally without additional database setup.

## Demo accounts

- Admin: `admin@codearena.dev` / `admin123`
- User: `student@codearena.dev` / `student123`

## Features

- Separate login flow with role-based redirects
- Admin dashboard for MCQ question-bank creation
- Student question list and individual answer pages
- Instant correct/incorrect feedback with the right answer and explanation
- Submission history per user with selected answer and result
- Seeded demo data created automatically in `data/db.json`

## Run locally

```bash
npm install
cmd /c npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Notes

- The database is file-backed and stored in `data/db.json`.
- Existing data from the old coding-question version is automatically upgraded to the new MCQ schema on first load. Incompatible legacy submissions are cleared because their structure no longer matches the new answer format.
