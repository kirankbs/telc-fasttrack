"use server";

export type FeedbackCategory = "bug" | "feature" | "question";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "bug",
  feature: "enhancement",
  question: "question",
};

export interface FeedbackAttachment {
  name: string;
  url: string | null;
}

export interface FeedbackParams {
  title: string;
  description: string;
  category: FeedbackCategory;
  pathname: string;
  userAgent: string;
  deviceType: "Mobile" | "Tablet" | "Desktop";
  attachments?: FeedbackAttachment[];
}

export interface FeedbackResult {
  issueNumber?: number;
  error?: string;
  attachmentsFailed?: boolean;
}

const COMMIT_SHA =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

export async function submitFeedback(
  params: FeedbackParams
): Promise<FeedbackResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { error: "Feedback is unavailable — GitHub token not configured." };
  }

  const { title, description, category, pathname, userAgent, deviceType, attachments } =
    params;

  const timestamp = new Date().toISOString();
  const label = CATEGORY_LABELS[category];

  const attachmentSection =
    attachments && attachments.length > 0
      ? "\n\n**Attachments:**\n" +
        attachments
          .map((a) =>
            a.url ? `![${a.name}](${a.url})` : `- ${a.name} (upload failed)`
          )
          .join("\n")
      : "";

  const body = [
    `**Description:**\n${description}`,
    `**Route:** \`${pathname}\``,
    `**App version:** ${COMMIT_SHA}`,
    `**Browser:** ${userAgent.slice(0, 120)}`,
    `**Device:** ${deviceType}`,
    `**Submitted at:** ${timestamp}`,
  ].join("\n\n") + attachmentSection;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      "https://api.github.com/repos/kirankbs/fastrack-deutsch/issues",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title,
          body,
          labels: [label, "user-feedback"],
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "GitHub token is invalid or expired." };
      }
      if (response.status === 422) {
        return { error: "Invalid issue data — please check your inputs." };
      }
      const text = await response.text().catch(() => "");
      return {
        error: `GitHub API error ${response.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { number: number };
    const attachmentsFailed = attachments?.some((a) => a.url === null) ?? false;
    return { issueNumber: data.number, ...(attachmentsFailed ? { attachmentsFailed: true } : {}) };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { error: "Request timed out. Please try again." };
    }
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
