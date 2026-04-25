import { randomUUID, scryptSync } from "node:crypto";
import { supabase } from "@/lib/supabase";

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

async function seedDatabase() {
  const adminId = randomUUID();
  const studentId = randomUUID();
  const now = new Date().toISOString();

  // Seed users
  const { error: usersError } = await supabase
    .from('users')
    .upsert([
      {
        id: adminId,
        name: "Admin",
        email: "admin@codearena.dev",
        password_hash: hashSeedPassword("admin123"),
        role: "admin",
        created_at: now,
      },
      {
        id: studentId,
        name: "Student",
        email: "student@codearena.dev",
        password_hash: hashSeedPassword("student123"),
        role: "user",
        created_at: now,
      },
    ]);

  if (usersError) {
    console.error('Error seeding users:', usersError);
  }

  // Seed problems
  const problems = buildSeedProblems(adminId, now);
  const { error: problemsError } = await supabase
    .from('problems')
    .upsert(problems.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      category: p.category,
      description: p.description,
      options: p.options,
      correct_option_id: p.correctOptionId,
      solution_explanation: p.solutionExplanation,
      constraints: p.constraints,
      tags: p.tags,
      published: p.published,
      created_at: p.createdAt,
      created_by: p.createdBy,
    })));

  if (problemsError) {
    console.error('Error seeding problems:', problemsError);
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
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
    role: user.role,
    isBlocked: user.is_blocked,
    createdAt: user.created_at,
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
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
    role: user.role,
    isBlocked: user.is_blocked,
    createdAt: user.created_at,
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
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    isBlocked: data.is_blocked,
    createdAt: data.created_at,
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
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    isBlocked: data.is_blocked,
    createdAt: data.created_at,
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
    .from('problems')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published problems:', error);
    return [];
  }

  return (data || []).map(problem => ({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    options: problem.options,
    correctOptionId: problem.correct_option_id,
    solutionExplanation: problem.solution_explanation,
    constraints: problem.constraints,
    tags: problem.tags,
    published: problem.published,
    createdAt: problem.created_at,
    createdBy: problem.created_by,
    photos: problem.photos,
  }));
}

export async function getAllProblems() {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all problems:', error);
    return [];
  }

  return (data || []).map(problem => ({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    options: problem.options,
    correctOptionId: problem.correct_option_id,
    solutionExplanation: problem.solution_explanation,
    constraints: problem.constraints,
    tags: problem.tags,
    published: problem.published,
    createdAt: problem.created_at,
    createdBy: problem.created_by,
    photos: problem.photos,
  }));
}

export async function getProblemBySlug(slug: string) {
  const { data, error } = await supabase
    .from('problems')
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
    title: data.title,
    slug: data.slug,
    difficulty: data.difficulty,
    category: data.category,
    description: data.description,
    options: data.options,
    correctOptionId: data.correct_option_id,
    solutionExplanation: data.solution_explanation,
    constraints: data.constraints,
    tags: data.tags,
    published: data.published,
    createdAt: data.created_at,
    createdBy: data.created_by,
    photos: data.photos,
  };
}

export async function getProblemById(id: string) {
  const { data, error } = await supabase
    .from('problems')
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
    title: data.title,
    slug: data.slug,
    difficulty: data.difficulty,
    category: data.category,
    description: data.description,
    options: data.options,
    correctOptionId: data.correct_option_id,
    solutionExplanation: data.solution_explanation,
    constraints: data.constraints,
    tags: data.tags,
    published: data.published,
    createdAt: data.created_at,
    createdBy: data.created_by,
    photos: data.photos,
  };
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
  const newProblem = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    category: problem.category,
    description: problem.description,
    options: problem.options,
    correct_option_id: problem.correctOptionId,
    solution_explanation: problem.solutionExplanation,
    constraints: problem.constraints,
    tags: problem.tags,
    published: problem.published,
    created_by: problem.createdBy,
    photos: problem.photos || {},
  };

  const { data, error } = await supabase
    .from('problems')
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
    slug: data.slug,
    difficulty: data.difficulty,
    category: data.category,
    description: data.description,
    options: data.options,
    correctOptionId: data.correct_option_id,
    solutionExplanation: data.solution_explanation,
    constraints: data.constraints,
    tags: data.tags,
    published: data.published,
    createdAt: data.created_at,
    createdBy: data.created_by,
    photos: data.photos,
  };
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
  const { data, error } = await supabase
    .from('problems')
    .update({
      title: updates.title,
      slug: updates.slug,
      difficulty: updates.difficulty,
      category: updates.category,
      description: updates.description,
      options: updates.options,
      correct_option_id: updates.correctOptionId,
      solution_explanation: updates.solutionExplanation,
      constraints: updates.constraints,
      tags: updates.tags,
      published: updates.published,
    })
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    console.error('Error updating problem:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    difficulty: data.difficulty,
    category: data.category,
    description: data.description,
    options: data.options,
    correctOptionId: data.correct_option_id,
    solutionExplanation: data.solution_explanation,
    constraints: data.constraints,
    tags: data.tags,
    published: data.published,
    createdAt: data.created_at,
    createdBy: data.created_by,
    photos: data.photos,
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
  const newSubmission = {
    id: randomUUID(),
    submitted_at: new Date().toISOString(),
    problem_id: submission.problemId,
    user_id: submission.userId,
    selected_option_id: submission.selectedOptionId,
    selected_option_text: submission.selectedOptionText,
    correct_option_id: submission.correctOptionId,
    correct_option_text: submission.correctOptionText,
    solution_explanation: submission.solutionExplanation,
    is_correct: submission.isCorrect,
    status: submission.status,
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
    submittedAt: data.submitted_at,
    problemId: data.problem_id,
    userId: data.user_id,
    selectedOptionId: data.selected_option_id,
    selectedOptionText: data.selected_option_text,
    correctOptionId: data.correct_option_id,
    correctOptionText: data.correct_option_text,
    solutionExplanation: data.solution_explanation,
    isCorrect: data.is_correct,
    status: data.status,
  };
}

export async function getSubmissionsForUser(userId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for user:', error);
    return [];
  }

  return (data || []).map(submission => ({
    id: submission.id,
    submittedAt: submission.submitted_at,
    problemId: submission.problem_id,
    userId: submission.user_id,
    selectedOptionId: submission.selected_option_id,
    selectedOptionText: submission.selected_option_text,
    correctOptionId: submission.correct_option_id,
    correctOptionText: submission.correct_option_text,
    solutionExplanation: submission.solution_explanation,
    isCorrect: submission.is_correct,
    status: submission.status,
  }));
}

export async function getSubmissionsForProblem(problemId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('problem_id', problemId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for problem:', error);
    return [];
  }

  return (data || []).map(submission => ({
    id: submission.id,
    submittedAt: submission.submitted_at,
    problemId: submission.problem_id,
    userId: submission.user_id,
    selectedOptionId: submission.selected_option_id,
    selectedOptionText: submission.selected_option_text,
    correctOptionId: submission.correct_option_id,
    correctOptionText: submission.correct_option_text,
    solutionExplanation: submission.solution_explanation,
    isCorrect: submission.is_correct,
    status: submission.status,
  }));
}

export async function getStats() {
  // Get counts in parallel
  const [problemsResult, submissionsResult, usersResult, adminsResult] = await Promise.all([
    supabase.from('problems').select('id', { count: 'exact', head: true }).eq('published', true),
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
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role?: "admin" | "user";
}) {
  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email.toLowerCase())
    .single();

  if (existing) {
    return null;
  }

  const newUser = {
    id: randomUUID(),
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash ?? hashSeedPassword(user.password ?? ""),
    role: user.role ?? "user",
    created_at: new Date().toISOString(),
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
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    isBlocked: data.is_blocked,
    createdAt: data.created_at,
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

  return {
    id: data.id,
    userId: data.user_id,
    problemIds: data.problem_ids,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
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
