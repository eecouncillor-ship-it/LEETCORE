export type Role = "admin" | "user";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionOption = {
  id: string;
  text: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isBlocked?: boolean;
  createdAt: string;
};

export type ProblemRecord = {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  options: QuestionOption[];
  correctOptionId: string;
  kind?: "mcq" | "fib";
  answer?: string; // for fill-in-the-blank
  photos?: Record<string, string>; // optional base64 data URIs for description/options
  solutionExplanation: string;
  constraints: string[];
  tags: string[];
  published: boolean;
  createdAt: string;
  createdBy: string;
};

export type SubmissionStatus = "Correct" | "Incorrect";

export type SubmissionRecord = {
  id: string;
  problemId: string;
  userId: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  solutionExplanation: string;
  isCorrect: boolean;
  status: SubmissionStatus;
  submittedAt: string;
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
