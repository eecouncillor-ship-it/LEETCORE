import { randomUUID, scryptSync } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

import type {
  DatabaseShape,
  Difficulty,
  ProblemRecord,
  QuestionOption,
  SessionRecord,
  SubmissionRecord,
  UserRecord,
} from "@/lib/types";

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

function buildSeedQuestions(): ProblemRecord[] {
  return [
    {
      id: randomUUID(),
      slug: "big-o-of-binary-search",
      title: "Big O of Binary Search",
      description:
        "When binary search is performed on a sorted array of n elements, what is the time complexity in the worst case?",
      options: createOptions([
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(1)",
      ]),
      correct_answer: "B",
      explanation:
        "Binary search halves the search space after each comparison, so the number of steps grows logarithmically with input size.",
      created_at: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      slug: "sql-clause-for-filtering-groups",
      title: "SQL Clause for Filtering Groups",
      description:
        "A query uses GROUP BY and should return only those groups whose count is greater than 3. Which SQL clause should be used for that condition?",
      options: createOptions([
        "WHERE",
        "ORDER BY",
        "HAVING",
        "LIMIT",
      ]),
      correct_answer: "C",
      explanation:
        "HAVING filters grouped rows after aggregation. WHERE filters raw rows before GROUP BY is applied.",
      created_at: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      slug: "http-status-for-missing-resource",
      title: "HTTP Status for Missing Resource",
      description:
        "A browser requests a route that does not exist on the server. Which HTTP status code is the most appropriate response?",
      options: createOptions([
        "200 OK",
        "301 Moved Permanently",
        "404 Not Found",
        "500 Internal Server Error",
      ]),
      correct_answer: "C",
      explanation:
        "404 Not Found is returned when the requested resource does not exist. A 500 would imply the server crashed while handling a valid request.",
      created_at: new Date().toISOString(),
    },
  ];
}

async function seedDatabase() {
  const adminId = randomUUID();
  const studentId = randomUUID();

  // Seed users
  const { error: usersError } = await supabase
    .from('users')
    .upsert([
      {
        id: adminId,
        email: "admin@codearena.dev",
        password: hashSeedPassword("admin123"),
        role: "admin",
      },
      {
        id: studentId,
        email: "student@codearena.dev",
        password: hashSeedPassword("student123"),
        role: "user",
      },
    ]);

  if (usersError) {
    console.error('Error seeding users:', usersError);
  }

  // Seed questions
  const questions = buildSeedQuestions();
  const { error: questionsError } = await supabase
    .from('questions')
    .upsert(questions);

  if (questionsError) {
    console.error('Error seeding questions:', questionsError);
  }
}



export async function getUsers() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (data || []).map(user => ({
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
  }));
}

export async function getStudentUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student users:', error);
    return [];
  }

  return (data || []).map(user => ({
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
  }));
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching user by email:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    role: data.role,
  };
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by id:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    role: data.role,
  };
}

export async function updateUserBlockedStatus(id: string, isBlocked: boolean) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_blocked: isBlocked })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user blocked status:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    isBlocked: data.is_blocked,
    createdAt: data.created_at,
  };
}

export async function getPublishedProblems() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published problems:', error);
    return [];
  }

  return (data || []).map(problem => ({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    options: problem.options,
    correct_answer: problem.correct_answer,
    explanation: problem.explanation,
    created_at: problem.created_at,
  }));
}

export async function getAllProblems() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all problems:', error);
    return [];
  }

  return (data || []).map(problem => ({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    options: problem.options,
    correct_answer: problem.correct_answer,
    explanation: problem.explanation,
    created_at: problem.created_at,
  }));
}

export async function getProblemById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching problem by id:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    options: data.options,
    correct_answer: data.correct_answer,
    explanation: data.explanation,
    created_at: data.created_at,
  };
}

export async function getProblemBySlug(slug: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching problem by slug:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    options: data.options,
    correct_answer: data.correct_answer,
    explanation: data.explanation,
    created_at: data.created_at,
  };
}

export async function createProblem(problem: {
  title: string;
  description: string;
  options: ProblemRecord["options"];
  correct_answer: string;
  explanation: string;
}) {
  const newProblem = {
    id: randomUUID(),
    slug: slugify(problem.title),
    created_at: new Date().toISOString(),
    title: problem.title,
    description: problem.description,
    options: problem.options,
    correct_answer: problem.correct_answer,
    explanation: problem.explanation,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert([newProblem])
    .select()
    .single();

  if (error) {
    console.error('Error creating problem:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    options: data.options,
    correct_answer: data.correct_answer,
    explanation: data.explanation,
    created_at: data.created_at,
  };
}

export async function updateProblemById(
  id: string,
  updates: {
    title: string;
    description: string;
    options: ProblemRecord["options"];
    correct_answer: string;
    explanation: string;
  },
) {
  const { data, error } = await supabase
    .from('questions')
    .update({
      title: updates.title,
      description: updates.description,
      options: updates.options,
      correct_answer: updates.correct_answer,
      explanation: updates.explanation,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating problem:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    options: data.options,
    correct_answer: data.correct_answer,
    explanation: data.explanation,
    created_at: data.created_at,
  };
}

export async function createSession(userId: string) {
  const session = {
    token: randomUUID(),
    user_id: userId,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
  };

  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return {
    token: data.token,
    userId: data.user_id,
    expiresAt: data.expires_at,
  };
}

export async function getSession(token: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching session:', error);
    return null;
  }

  if (!data) return null;

  return {
    token: data.token,
    userId: data.user_id,
    expiresAt: data.expires_at,
  };
}

export async function createPasswordResetTokenByEmail(email: string) {
  // First get the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (userError || !user) {
    return null;
  }

  const token = randomUUID();
  const expires_at = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  const { data, error } = await supabase
    .from('password_resets')
    .insert([{
      token,
      user_id: user.id,
      expires_at,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating password reset token:', error);
    return null;
  }

  return {
    token: data.token,
    userId: data.user_id,
    expiresAt: data.expires_at,
  };
}


export async function getPasswordReset(token: string) {
  const { data, error } = await supabase
    .from('password_resets')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching password reset:', error);
    return null;
  }

  if (!data) return null;

  return {
    token: data.token,
    userId: data.user_id,
    expiresAt: data.expires_at,
  };
}

export async function consumePasswordResetToken(token: string) {
  const { error } = await supabase
    .from('password_resets')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('Error consuming password reset token:', error);
  }
}

export async function updateUserPassword(userId: string, password: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: hashSeedPassword(password) })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user password:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    isBlocked: data.is_blocked,
    createdAt: data.created_at,
  };
}

export async function deleteSession(token: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('Error deleting session:', error);
  }
}

export async function createSubmission(submission: {
  user_email: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}) {
  const newSubmission = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    user_email: submission.user_email.toLowerCase(),
    question_id: submission.question_id,
    selected_answer: submission.selected_answer,
    is_correct: submission.is_correct,
  };

  const { data, error } = await supabase
    .from('submissions')
    .insert([newSubmission])
    .select()
    .single();

  if (error) {
    console.error('Error creating submission:', error);
    return null;
  }

  return {
    id: data.id,
    user_email: data.user_email,
    question_id: data.question_id,
    selected_answer: data.selected_answer,
    is_correct: data.is_correct,
    created_at: data.created_at,
  };
}

export async function getSubmissionsForUser(userEmail: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_email', userEmail.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for user:', error);
    return [];
  }

  return (data || []).map(submission => ({
    id: submission.id,
    user_email: submission.user_email,
    question_id: submission.question_id,
    selected_answer: submission.selected_answer,
    is_correct: submission.is_correct,
    created_at: submission.created_at,
  }));
}

export async function getSubmissionsForQuestion(questionId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for question:', error);
    return [];
  }

  return (data || []).map(submission => ({
    id: submission.id,
    user_email: submission.user_email,
    question_id: submission.question_id,
    selected_answer: submission.selected_answer,
    is_correct: submission.is_correct,
    created_at: submission.created_at,
  }));
}

export async function getStats() {
  // Get counts in parallel
  const [problemsResult, submissionsResult, usersResult, adminsResult] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
  ]);

  return {
    totalProblems: problemsResult.count || 0,
    totalSubmissions: submissionsResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalAdmins: adminsResult.count || 0,
  };
}

export async function createUser(user: {
  email: string;
  password?: string;
  passwordHash?: string;
  role?: "admin" | "user";
}) {
  // Check if user already exists
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email.toLowerCase());

  if (checkError) {
    console.error('Error checking user:', checkError);
    return null;
  }

  // If any users exist with this email, return null
  if (existing && existing.length > 0) {
    console.log('User already exists with email:', user.email);
    return null;
  }

  const newUser = {
    id: randomUUID(),
    email: user.email,
    password: user.passwordHash ?? hashSeedPassword(user.password ?? ""),
    role: user.role ?? "user",
  };

  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    role: data.role,
  };
}

export async function createMockSession(userId: string, problemIds: string[], durationMinutes: number) {
  const now = new Date();
  const started_at = now.toISOString();
  const expires_at = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

  const session = {
    id: randomUUID(),
    user_id: userId,
    problem_ids: problemIds,
    started_at,
    expires_at,
    created_at: started_at,
  };

  const { data, error } = await supabase
    .from('mock_sessions')
    .insert([session])
    .select()
    .single();

  if (error) {
    console.error('Error creating mock session:', error);
    return null;
  }

  const mappedSession = {
    id: data.id,
    userId: data.user_id,
    problemIds: data.problem_ids,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
  console.log('[DB] createMockSession - Raw DB response:', data);
  console.log('[DB] createMockSession - Mapped session:', mappedSession);
  console.log('[DB] createMockSession - expiresAt value:', mappedSession.expiresAt);
  return mappedSession;
}

export async function getMockSessionById(id: string) {
  const { data, error } = await supabase
    .from('mock_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching mock session:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    problemIds: data.problem_ids,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}

export async function createMockResult(userId: string, sessionId: string, total: number, correct: number) {
  const result = {
    id: randomUUID(),
    user_id: userId,
    session_id: sessionId,
    total,
    correct,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('mock_results')
    .insert([result])
    .select()
    .single();

  if (error) {
    console.error('Error creating mock result:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    sessionId: data.session_id,
    total: data.total,
    correct: data.correct,
    createdAt: data.created_at,
  };
}

export async function getMockResultsForUser(userId: string) {
  const { data, error } = await supabase
    .from('mock_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mock results for user:', error);
    return [];
  }

  return (data || []).map(result => ({
    id: result.id,
    userId: result.user_id,
    sessionId: result.session_id,
    total: result.total,
    correct: result.correct,
    createdAt: result.created_at,
  }));
}
