import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID, scryptSync } from "node:crypto";
import path from "node:path";
import { put, head, del, get } from '@vercel/blob';

import type {
  DatabaseShape,
  Difficulty,
  ProblemRecord,
  QuestionOption,
  SessionRecord,
  SubmissionRecord,
  UserRecord,
} from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "db.json");
const databaseSchemaVersion = 2;
const BLOB_KEY = 'codearena-database.json';

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'Missing BLOB_READ_WRITE_TOKEN environment variable for Vercel Blob',
    );
  }

  return token;
}

function hashSeedPassword(password: string) {
  return scryptSync(password, "codearena-seed-salt", 64).toString("hex");
}

function createOptions(
  items: [string, string, string, string],
): QuestionOption[] {
  return items.map((text, index) => ({
    id: String.fromCharCode(65 + index),
    text,
  }));
}

function buildSeedProblems(adminId: string, now: string): ProblemRecord[] {
  return [
    {
      id: randomUUID(),
      title: "Big O of Binary Search",
      slug: "big-o-of-binary-search",
      difficulty: "Easy",
      category: "Algorithms",
      description:
        "When binary search is performed on a sorted array of n elements, what is the time complexity in the worst case?",
      options: createOptions([
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(1)",
      ]),
      correctOptionId: "B",
      solutionExplanation:
        "Binary search halves the search space after each comparison, so the number of steps grows logarithmically with input size.",
      constraints: [
        "The array is already sorted.",
        "Only one value is being searched at a time.",
      ],
      tags: ["algorithms", "complexity", "binary-search"],
      published: true,
      createdAt: now,
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      title: "SQL Clause for Filtering Groups",
      slug: "sql-clause-for-filtering-groups",
      difficulty: "Medium",
      category: "Databases",
      description:
        "A query uses GROUP BY and should return only those groups whose count is greater than 3. Which SQL clause should be used for that condition?",
      options: createOptions([
        "WHERE",
        "ORDER BY",
        "HAVING",
        "LIMIT",
      ]),
      correctOptionId: "C",
      solutionExplanation:
        "HAVING filters grouped rows after aggregation. WHERE filters raw rows before GROUP BY is applied.",
      constraints: [
        "Assume standard SQL syntax.",
        "The condition is applied after grouping.",
      ],
      tags: ["sql", "group-by", "having"],
      published: true,
      createdAt: now,
      createdBy: adminId,
    },
    {
      id: randomUUID(),
      title: "HTTP Status for Missing Resource",
      slug: "http-status-for-missing-resource",
      difficulty: "Easy",
      category: "Web",
      description:
        "A browser requests a route that does not exist on the server. Which HTTP status code is the most appropriate response?",
      options: createOptions([
        "200 OK",
        "301 Moved Permanently",
        "404 Not Found",
        "500 Internal Server Error",
      ]),
      correctOptionId: "C",
      solutionExplanation:
        "404 Not Found is returned when the requested resource does not exist. A 500 would imply the server crashed while handling a valid request.",
      constraints: [
        "The resource truly does not exist.",
        "No redirect is configured for the requested route.",
      ],
      tags: ["http", "web", "backend"],
      published: true,
      createdAt: now,
      createdBy: adminId,
    },
  ];
}

function createSeedData(): DatabaseShape {
  const adminId = randomUUID();
  const studentId = randomUUID();
  const now = new Date().toISOString();

  return {
    schemaVersion: databaseSchemaVersion,
    users: [
      {
        id: adminId,
        name: "Admin",
        email: "admin@codearena.dev",
        passwordHash: hashSeedPassword("admin123"),
        role: "admin",
        createdAt: now,
      },
      {
        id: studentId,
        name: "Student",
        email: "student@codearena.dev",
        passwordHash: hashSeedPassword("student123"),
        role: "user",
        createdAt: now,
      },
    ],
    problems: buildSeedProblems(adminId, now),
    submissions: [],
    sessions: [],
    passwordResets: [],
  };
}

function normalizeUsers(users: unknown): UserRecord[] {
  if (!Array.isArray(users) || users.length === 0) {
    return createSeedData().users;
  }

  return users as UserRecord[];
}

function normalizeSessions(sessions: unknown): SessionRecord[] {
  return Array.isArray(sessions) ? (sessions as SessionRecord[]) : [];
}

function isMcqProblem(problem: unknown): problem is ProblemRecord {
  if (!problem || typeof problem !== "object") {
    return false;
  }

  const candidate = problem as Partial<ProblemRecord>;
  return (
    Array.isArray(candidate.options) &&
    typeof candidate.correctOptionId === "string" &&
    typeof candidate.solutionExplanation === "string"
  );
}

function isMcqSubmission(submission: unknown): submission is SubmissionRecord {
  if (!submission || typeof submission !== "object") {
    return false;
  }

  const candidate = submission as Partial<SubmissionRecord>;
  return (
    typeof candidate.selectedOptionId === "string" &&
    typeof candidate.correctOptionId === "string" &&
    typeof candidate.solutionExplanation === "string"
  );
}

function normalizeDatabase(raw: unknown): DatabaseShape {
  if (!raw || typeof raw !== "object") {
    return createSeedData();
  }

  const candidate = raw as Partial<DatabaseShape>;
  const users = normalizeUsers(candidate.users);
  const sessions = normalizeSessions(candidate.sessions);
  const adminUser = users.find((user) => user.role === "admin") ?? users[0];
  const now = new Date().toISOString();

  const problems =
    Array.isArray(candidate.problems) &&
    candidate.problems.length > 0 &&
    candidate.problems.every(isMcqProblem)
      ? (candidate.problems as ProblemRecord[])
      : buildSeedProblems(adminUser.id, now);

  const submissions =
    Array.isArray(candidate.submissions) &&
    candidate.submissions.every(isMcqSubmission)
      ? (candidate.submissions as SubmissionRecord[])
      : [];

  const passwordResets = Array.isArray(candidate.passwordResets)
    ? (candidate.passwordResets as any[])
    : [];
  const mockSessions = Array.isArray((candidate as any).mockSessions)
    ? ((candidate as any).mockSessions as any[])
    : [];
  const mockResults = Array.isArray((candidate as any).mockResults)
    ? ((candidate as any).mockResults as any[])
    : [];

  return {
    schemaVersion: databaseSchemaVersion,
    users,
    problems,
    submissions,
    sessions,
    passwordResets,
    mockSessions,
    mockResults,
  };
}

async function ensureDatabase() {
  // In development/local environment, use local file
  if (!process.env.VERCEL) {
    await mkdir(dataDirectory, { recursive: true });
    if (!existsSync(databasePath)) {
      await writeFile(
        databasePath,
        JSON.stringify(createSeedData(), null, 2),
        "utf8",
      );
    }
    return;
  }

  // In Vercel/production, check if blob exists
  try {
    await head(BLOB_KEY, { token: getBlobToken() });
  } catch {
    // Blob doesn't exist, create it
    await put(BLOB_KEY, JSON.stringify(createSeedData(), null, 2), {
      access: 'public',
      allowOverwrite: true,
      token: getBlobToken(),
    });
  }
}

async function writeDatabase(data: DatabaseShape) {
  if (!process.env.VERCEL) {
    await writeFile(databasePath, JSON.stringify(data, null, 2), "utf8");
    return;
  }

  await put(BLOB_KEY, JSON.stringify(data, null, 2), {
    access: 'public',
    allowOverwrite: true,
    token: getBlobToken(),
  });
}

async function readDatabase() {
  await ensureDatabase();

  if (!process.env.VERCEL) {
    try {
      const file = await readFile(databasePath, "utf8");
      const raw = JSON.parse(file) as unknown;
      const normalized = normalizeDatabase(raw);

      if ((raw as Partial<DatabaseShape>)?.schemaVersion !== databaseSchemaVersion) {
        await writeDatabase(normalized);
      }

      return normalized;
    } catch (error) {
      console.error('Error reading local database:', error);
      const seedData = createSeedData();
      await writeDatabase(seedData);
      return seedData;
    }
  }

  // In Vercel, read from blob
  try {
    // Get blob metadata
    await head(BLOB_KEY, { token: getBlobToken() });

    const blobResponse = await get(BLOB_KEY, {
      access: 'public',
      token: getBlobToken(),
    });

    if (!blobResponse || blobResponse.statusCode !== 200 || !blobResponse.stream) {
      console.error('Blob read failed or returned no content');
      const normalized = createSeedData();
      await writeDatabase(normalized);
      return normalized;
    }

    const text = await new Response(blobResponse.stream).text();

    if (!text || text.trim().startsWith('<') || !text.trim().startsWith('{')) {
      console.error('Invalid blob content received');
      const normalized = createSeedData();
      await writeDatabase(normalized);
      return normalized;
    }

    const raw = JSON.parse(text) as unknown;
    const normalized = normalizeDatabase(raw);

    if ((raw as Partial<DatabaseShape>)?.schemaVersion !== databaseSchemaVersion) {
      await writeDatabase(normalized);
    }

    return normalized;
  } catch (error) {
    console.error('Error reading blob database:', error);
    // If blob doesn't exist or can't be read, create new database
    const normalized = createSeedData();
    try {
      await writeDatabase(normalized);
    } catch (writeError) {
      console.error('Error writing database:', writeError);
    }
    return normalized;
  }
}

export async function getUsers() {
  const db = await readDatabase() as DatabaseShape;
  return db!.users;
}

export async function getStudentUsers() {
  const db = await readDatabase() as DatabaseShape;
  return db!
    .users
    .filter((user) => user.role === "user")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getUserByEmail(email: string) {
  const db = await readDatabase() as DatabaseShape;
  return db!.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.users.find((user) => user.id === id);
}

export async function updateUserBlockedStatus(id: string, isBlocked: boolean) {
  const db = await readDatabase() as DatabaseShape;
  const targetIndex = db.users.findIndex((user) => user.id === id);

  if (targetIndex === -1) {
    return null;
  }

  const user = db.users[targetIndex];
  const updatedUser = {
    ...user,
    isBlocked,
  };

  db.users[targetIndex] = updatedUser;
  await writeDatabase(db);
  return updatedUser;
}

export async function getPublishedProblems() {
  const db = await readDatabase();
  if (!db || !db.problems) {
    return [];
  }
  return db.problems
    .filter((problem) => problem.published)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getAllProblems() {
  const db = await readDatabase() as DatabaseShape;
  return db.problems.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function getProblemBySlug(slug: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.problems.find((problem) => problem.slug === slug);
}

export async function getProblemById(id: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.problems.find((p) => p.id === id);
}

export async function createProblem(problem: {
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  options: ProblemRecord["options"];
  correctOptionId: string;
  solutionExplanation: string;
  constraints: string[];
  tags: string[];
  published: boolean;
  createdBy: string;
  photos?: Record<string, string>;
}) {
  const db = await readDatabase() as DatabaseShape;

  const newProblem: ProblemRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...problem,
  };

  db.problems.unshift(newProblem);
  await writeDatabase(db);
  return newProblem;
}

export async function updateProblemBySlug(
  slug: string,
  updates: {
    title: string;
    slug: string;
    difficulty: Difficulty;
    category: string;
    description: string;
    options: ProblemRecord["options"];
    correctOptionId: string;
    solutionExplanation: string;
    constraints: string[];
    tags: string[];
    published: boolean;
  },
) {
  const db = await readDatabase() as DatabaseShape;
  const targetIndex = db.problems.findIndex((problem) => problem.slug === slug);

  if (targetIndex === -1) {
    return null;
  }

  const current = db.problems[targetIndex];
  const updatedProblem: ProblemRecord = {
    ...current,
    ...updates,
  };

  db.problems[targetIndex] = updatedProblem;
  await writeDatabase(db);
  return updatedProblem;
}

export async function createSession(userId: string) {
  const db = await readDatabase() as DatabaseShape;
  const session: SessionRecord = {
    token: randomUUID(),
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };

  db.sessions = db.sessions
    .filter((item) => new Date(item.expiresAt).getTime() > Date.now())
    .concat(session);

  await writeDatabase(db);
  return session;
}

export async function getSession(token: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.sessions.find((session) => session.token === token);
}

export async function createPasswordResetTokenByEmail(email: string) {
  const db = await readDatabase() as DatabaseShape;
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return null;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  const reset = { token, userId: user.id, expiresAt };

  db.passwordResets = (db.passwordResets || []).filter(
    (r) => new Date(r.expiresAt).getTime() > Date.now(),
  );

  db.passwordResets.unshift(reset as any);
  await writeDatabase(db);
  return reset;
}


export async function getPasswordReset(token: string) {
  const db = await readDatabase() as DatabaseShape;
  return (db.passwordResets || []).find((r) => r.token === token);
}

export async function consumePasswordResetToken(token: string) {
  const db = await readDatabase() as DatabaseShape;
  db.passwordResets = (db.passwordResets || []).filter((r) => r.token !== token);
  await writeDatabase(db);
}

export async function updateUserPassword(userId: string, password: string) {
  const db = await readDatabase() as DatabaseShape;
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  const updated = { ...db.users[idx], passwordHash: hashSeedPassword(password) };
  db.users[idx] = updated;
  await writeDatabase(db);
  return updated;
}

export async function deleteSession(token: string) {
  const db = await readDatabase() as DatabaseShape;
  db.sessions = db.sessions.filter((session) => session.token !== token);
  await writeDatabase(db);
}

export async function createSubmission(submission: {
  problemId: string;
  userId: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  solutionExplanation: string;
  isCorrect: boolean;
  status: SubmissionRecord["status"];
}) {
  const db = await readDatabase() as DatabaseShape;
  const newSubmission: SubmissionRecord = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...submission,
  };

  db.submissions.unshift(newSubmission);
  await writeDatabase(db);
  return newSubmission;
}

export async function getSubmissionsForUser(userId: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.submissions
    .filter((submission) => submission.userId === userId)
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}

export async function getSubmissionsForProblem(problemId: string) {
  const db = await readDatabase() as DatabaseShape;
  return db.submissions.filter((submission) => submission.problemId === problemId);
}

export async function getStats() {
  const db = await readDatabase();
  if (!db) {
    return {
      totalProblems: 0,
      totalSubmissions: 0,
      totalUsers: 0,
      totalAdmins: 0,
    };
  }
  const totalUsers = (db.users || []).filter((user) => user.role === "user").length;
  const totalAdmins = (db.users || []).filter((user) => user.role === "admin").length;
  return {
    totalProblems: (db.problems || []).filter((problem) => problem.published).length,
    totalSubmissions: (db.submissions || []).length,
    totalUsers,
    totalAdmins,
  };
}

export async function createUser(user: {
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role?: "admin" | "user";
}) {
  const db = await readDatabase() as DatabaseShape;

  const existing = db.users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    return null;
  }

  const newUser = {
    id: randomUUID(),
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash ?? hashSeedPassword(user.password ?? ""),
    role: user.role ?? "user",
    createdAt: new Date().toISOString(),
  };

  db.users.unshift(newUser);
  await writeDatabase(db);
  return newUser;
}

export async function createMockSession(userId: string, problemIds: string[], durationMinutes: number) {
  const db = await readDatabase() as DatabaseShape;
  const now = new Date();
  const startedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
  const session = {
    id: randomUUID(),
    userId,
    problemIds,
    startedAt,
    expiresAt,
    createdAt: startedAt,
  } as any;

  db.mockSessions = (db.mockSessions || []).filter((s) => new Date(s.expiresAt).getTime() > Date.now());
  db.mockSessions.unshift(session);
  await writeDatabase(db);
  return session;
}

export async function getMockSessionById(id: string) {
  const db = await readDatabase() as DatabaseShape;
  return (db.mockSessions || []).find((s) => s.id === id) as any | undefined;
}

export async function createMockResult(userId: string, sessionId: string, total: number, correct: number) {
  const db = await readDatabase() as DatabaseShape;
  const rec = {
    id: randomUUID(),
    userId,
    sessionId,
    total,
    correct,
    createdAt: new Date().toISOString(),
  } as any;

  db.mockResults = (db.mockResults || []).filter((r) => true);
  db.mockResults.unshift(rec);
  await writeDatabase(db);
  return rec;
}

export async function getMockResultsForUser(userId: string) {
  const db = await readDatabase() as DatabaseShape;
  return (db.mockResults || []).filter((r) => r.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
