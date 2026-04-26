export type Role = "admin" | "user";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionOption = {
  id: string;
  text: string;
};

export type UserRecord = {
  id: string;
  email: string;
  password: string;
  role: Role;
};

export type ProblemRecord = {
  id: string;
  title: string;
  description: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  created_at: string;
};

export type SubmissionStatus = "Correct" | "Incorrect";

export type SubmissionRecord = {
  id: string;
  user_email: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  submitted_at: string;
};

export type SessionRecord = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type PasswordResetRecord = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type DatabaseShape = {
  schemaVersion: number;
  users: UserRecord[];
  problems: ProblemRecord[];
  submissions: SubmissionRecord[];
  sessions: SessionRecord[];
  passwordResets?: PasswordResetRecord[];
  mockSessions?: MockSession[];
  mockResults?: MockResult[];
};

export type MockSession = {
  id: string;
  userId: string;
  problemIds: string[];
  startedAt: string;
  expiresAt: string;
  createdAt: string;
};

export type MockResult = {
  id: string;
  userId: string;
  sessionId: string;
  total: number;
  correct: number;
  createdAt: string;
};
