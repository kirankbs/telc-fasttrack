import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackFAB } from "@/components/FeedbackFAB";

vi.mock("next/navigation", () => ({
  usePathname: () => "/exam",
}));

vi.mock("@/lib/actions/feedback", () => ({
  submitFeedback: vi.fn(),
}));

vi.mock("@vercel/blob/client", () => ({
  upload: vi.fn().mockResolvedValue({ url: "https://blob.vercel.com/test.png" }),
}));

import { submitFeedback } from "@/lib/actions/feedback";

const mockSubmit = vi.mocked(submitFeedback);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FeedbackFAB — open/close", () => {
  it("renders the FAB button", () => {
    render(<FeedbackFAB />);
    expect(screen.getByTestId("feedback-fab")).toBeInTheDocument();
  });

  it("opens modal when FAB is clicked", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();
  });

  it("closes modal when Cancel is clicked", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("feedback-cancel"));
    expect(screen.queryByTestId("feedback-modal")).not.toBeInTheDocument();
  });

  it("closes modal when Escape is pressed", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByTestId("feedback-modal")).not.toBeInTheDocument();
  });

  it("FAB button has minimum 44px height", () => {
    render(<FeedbackFAB />);
    const fab = screen.getByTestId("feedback-fab");
    // h-14 = 56px in Tailwind. Class presence is sufficient for DOM tests.
    expect(fab.className).toContain("h-14");
  });

  it("FAB has accessible aria-label", () => {
    render(<FeedbackFAB />);
    expect(screen.getByTestId("feedback-fab")).toHaveAttribute(
      "aria-label",
      "Send feedback"
    );
  });

  it("dialog has aria-modal and aria-labelledby", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    const dialog = screen.getByTestId("feedback-modal");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "feedback-modal-title");
  });
});

describe("FeedbackFAB — form fields", () => {
  it("form is empty when modal opens", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByTestId<HTMLInputElement>("feedback-title").value).toBe(
      ""
    );
    expect(
      screen.getByTestId<HTMLTextAreaElement>("feedback-description").value
    ).toBe("");
  });

  it("all three category options are present", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    const select = screen.getByTestId<HTMLSelectElement>("feedback-category");
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain("bug");
    expect(options).toContain("feature");
    expect(options).toContain("question");
  });

  it("blocks submit when title is empty", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a sufficiently long description for testing."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit when description is too short", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "Test title");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "Too short"
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("live counter updates as description changes", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    // Use fireEvent.change for deterministic character count across environments
    const textarea = screen.getByTestId("feedback-description");
    fireEvent.change(textarea, { target: { value: "HelloWorld" } });
    const counter = document.getElementById("feedback-desc-counter");
    expect(counter?.textContent).toMatch(/10/);
  });
});

describe("FeedbackFAB — submission states", () => {
  it("shows success state with issue number after submit", async () => {
    mockSubmit.mockResolvedValue({ issueNumber: 99 });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-success")).toBeInTheDocument();
    });
    expect(screen.getByTestId("feedback-issue-number")).toHaveTextContent(
      "#99"
    );
  });

  it("shows error banner with message on API failure", async () => {
    mockSubmit.mockResolvedValue({ error: "GitHub API error 500" });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-error-banner")).toBeInTheDocument();
    });
    expect(screen.getByTestId("feedback-error-banner")).toHaveTextContent(
      "GitHub API error 500"
    );
  });

  it("shows Retry button on error state", async () => {
    mockSubmit.mockResolvedValue({ error: "Timeout" });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-retry")).toBeInTheDocument();
    });
  });

  it("resets to idle form after Retry click", async () => {
    mockSubmit.mockResolvedValue({ error: "Timeout" });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-retry")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("feedback-retry"));
    expect(screen.getByTestId("feedback-submit")).toBeInTheDocument();
    expect(screen.queryByTestId("feedback-error-banner")).not.toBeInTheDocument();
  });

  it("disables submit button while submitting (no double-click)", async () => {
    let resolveSubmit!: (v: { issueNumber: number }) => void;
    mockSubmit.mockReturnValue(
      new Promise((res) => {
        resolveSubmit = res;
      })
    );

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    expect(screen.getByTestId("feedback-submit")).toBeDisabled();

    // Resolve the pending promise and flush state updates
    await act(async () => {
      resolveSubmit({ issueNumber: 1 });
    });
  });
});

describe("FeedbackFAB — attachments", () => {
  it("renders file input in form", async () => {
    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    expect(screen.getByTestId("feedback-attachment")).toBeInTheDocument();
  });

  it("shows attachmentsFailed warning on success when blobs failed", async () => {
    mockSubmit.mockResolvedValue({ issueNumber: 5, attachmentsFailed: true });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-attachments-warning")).toBeInTheDocument();
    });
  });

  it("does not show attachmentsFailed warning when all uploads succeed", async () => {
    mockSubmit.mockResolvedValue({ issueNumber: 6 });

    render(<FeedbackFAB />);
    await userEvent.click(screen.getByTestId("feedback-fab"));
    await userEvent.type(screen.getByTestId("feedback-title"), "My bug report");
    await userEvent.type(
      screen.getByTestId("feedback-description"),
      "This is a detailed description that is long enough to pass validation."
    );
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("feedback-success")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("feedback-attachments-warning")).not.toBeInTheDocument();
  });
});
