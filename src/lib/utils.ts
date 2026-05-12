export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * Pretty-print fill-in-the-blank submissions stored as JSON arrays.
 * Single blank: `ans1 -> value`; multiple: `blank1 -> ...` per line.
 */
export function formatSubmissionAnswerDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[")) {
    return raw;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return raw;
    }

    const rows: { submitted: string }[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        return raw;
      }
      const o = item as Record<string, unknown>;
      if (typeof o.submitted !== "string") {
        return raw;
      }
      rows.push({ submitted: o.submitted });
    }

    if (rows.length === 1) {
      return `ans1 -> ${rows[0].submitted}`;
    }

    return rows
      .map((r, i) => `blank${i + 1} -> ${r.submitted}`)
      .join("\n");
  } catch {
    return raw;
  }
}

export function getDifficultyTextClass(difficulty: string) {
  if (difficulty === "Easy") {
    return "text-emerald-600";
  }

  if (difficulty === "Medium") {
    return "text-amber-500";
  }

  return "text-rose-500";
}
