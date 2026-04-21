"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { usePathname } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { submitFeedback, type FeedbackCategory } from "@/lib/actions/feedback";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface AttachmentItem {
  file: File;
  error?: string;
}

const MAX_TITLE_LENGTH = 80;
const MIN_DESCRIPTION_LENGTH = 20;

type ModalState = "idle" | "submitting" | "success" | "error";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "question", label: "Question" },
];

export function FeedbackFAB() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [issueNumber, setIssueNumber] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentsFailed, setAttachmentsFailed] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("bug");
    setModalState("idle");
    setIssueNumber(null);
    setApiError(null);
    setTitleError(null);
    setDescError(null);
    setAttachments([]);
    setAttachmentError(null);
    setAttachmentsFailed(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const combined = [...attachments, ...selected.map((f) => ({ file: f }))];
    if (combined.length > MAX_FILES) {
      setAttachmentError(`Maximum ${MAX_FILES} files allowed`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const validated = combined.map((item) => ({
      file: item.file,
      error: item.file.size > MAX_FILE_SIZE ? "File exceeds 10 MB limit" : undefined,
    }));
    setAttachments(validated);
    setAttachmentError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentError(null);
  };

  const hasAttachmentErrors = attachments.some((a) => a.error);

  const openModal = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  // Focus trap: move focus into dialog when it opens
  useEffect(() => {
    if (open) {
      // Timeout allows the dialog to render before focusing
      const id = setTimeout(() => firstFocusableRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeModal]);

  // Trap focus inside dialog
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required.");
      valid = false;
    } else if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
      valid = false;
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      setDescError(
        `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`
      );
      valid = false;
    }

    if (!valid) return;

    setModalState("submitting");
    setApiError(null);

    const ua = navigator.userAgent;
    const deviceType = /Mobi|Android/i.test(ua)
      ? "Mobile"
      : /Tablet|iPad/i.test(ua)
        ? "Tablet"
        : "Desktop";

    const uploadedAttachments = await Promise.all(
      attachments.filter((a) => !a.error).map(async ({ file }) => {
        try {
          const blob = await upload(
            `feedback-attachments/${file.name}`,
            file,
            { access: "public", handleUploadUrl: "/api/blob-upload" }
          );
          return { name: file.name, url: blob.url };
        } catch {
          return { name: file.name, url: null as string | null };
        }
      })
    );

    const result = await submitFeedback({
      title: title.trim(),
      description,
      category,
      pathname,
      userAgent: ua,
      deviceType,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    });

    if (result.error) {
      setApiError(result.error);
      setModalState("error");
    } else {
      setIssueNumber(result.issueNumber ?? null);
      setAttachmentsFailed(result.attachmentsFailed === true);
      setModalState("success");
    }
  };

  const handleRetry = () => {
    setModalState("idle");
    setApiError(null);
  };

  return (
    <>
      <button
        data-testid="feedback-fab"
        onClick={openModal}
        aria-label="Send feedback"
        className={[
          "fixed z-50 flex items-center justify-center",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-brand-600 text-white",
          "hover:bg-brand-700 active:scale-95 transition-all duration-200",
          "bottom-6 right-4 md:right-6",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
          role="presentation"
        >
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-neutral-900/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Dialog */}
          <dialog
            ref={dialogRef}
            open
            data-testid="feedback-modal"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            className={[
              "relative z-10 bg-surface rounded-t-2xl sm:rounded-2xl",
              "w-full sm:max-w-lg max-h-[90vh] overflow-y-auto",
              "p-6 shadow-xl",
              "flex flex-col gap-4",
              "m-0",
            ].join(" ")}
          >
            {modalState === "success" ? (
              <div
                data-testid="feedback-success"
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-12 h-12 text-success"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h2 className="text-xl font-semibold text-text-primary">
                  Feedback submitted
                </h2>
                {issueNumber !== null && (
                  <p
                    data-testid="feedback-issue-number"
                    className="text-text-secondary text-sm"
                  >
                    Tracked as issue{" "}
                    <a
                      href={`https://github.com/kirankbs/fastrack-deutsch/issues/${issueNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 underline hover:text-brand-600"
                    >
                      #{issueNumber}
                    </a>
                  </p>
                )}
                {attachmentsFailed && (
                  <p
                    data-testid="feedback-attachments-warning"
                    className="text-sm text-text-secondary bg-surface-container rounded-xl px-4 py-2"
                  >
                    Some attachments could not be uploaded and are missing from the issue.
                  </p>
                )}
                <button
                  data-testid="feedback-close-success"
                  onClick={closeModal}
                  className="mt-2 min-h-[44px] px-6 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2
                  id="feedback-modal-title"
                  className="text-xl font-semibold text-text-primary"
                >
                  Send Feedback
                </h2>

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="feedback-title-input"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Title <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="feedback-title-input"
                    ref={firstFocusableRef}
                    data-testid="feedback-title"
                    type="text"
                    value={title}
                    maxLength={MAX_TITLE_LENGTH}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError && e.target.value.trim()) {
                        setTitleError(null);
                      }
                    }}
                    placeholder="Brief summary"
                    required
                    aria-required="true"
                    aria-describedby={titleError ? "feedback-title-error" : undefined}
                    className={[
                      "w-full min-h-[44px] rounded-xl border px-3 py-2 text-text-primary bg-surface",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      titleError ? "border-error" : "border-border",
                    ].join(" ")}
                  />
                  <div className="flex justify-between items-center">
                    {titleError ? (
                      <p
                        id="feedback-title-error"
                        role="alert"
                        className="text-error text-xs"
                      >
                        {titleError}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-text-tertiary">
                      {title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="feedback-description-input"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Description <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="feedback-description-input"
                    data-testid="feedback-description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (
                        descError &&
                        e.target.value.length >= MIN_DESCRIPTION_LENGTH
                      ) {
                        setDescError(null);
                      }
                    }}
                    placeholder="Describe the issue or idea in detail (min. 20 characters)"
                    rows={4}
                    required
                    aria-required="true"
                    aria-describedby="feedback-desc-counter"
                    className={[
                      "w-full rounded-xl border px-3 py-2 text-text-primary bg-surface",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      "resize-none",
                      descError ? "border-error" : "border-border",
                    ].join(" ")}
                  />
                  <div className="flex justify-between items-center">
                    {descError ? (
                      <p
                        role="alert"
                        className="text-error text-xs"
                      >
                        {descError}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span
                      id="feedback-desc-counter"
                      className="text-xs text-text-tertiary"
                      aria-live="polite"
                    >
                      {description.length} chars
                      {description.length < MIN_DESCRIPTION_LENGTH && (
                        <span className="text-warning">
                          {" "}
                          (min {MIN_DESCRIPTION_LENGTH})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="feedback-category-select"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Category
                  </label>
                  <select
                    id="feedback-category-select"
                    data-testid="feedback-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as FeedbackCategory)
                    }
                    className="w-full min-h-[44px] rounded-xl border border-border px-3 py-2 text-text-primary bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File attachments */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="feedback-attachment-input"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Screenshots or files{" "}
                    <span className="text-text-tertiary font-normal">(optional)</span>
                  </label>
                  <input
                    id="feedback-attachment-input"
                    ref={fileInputRef}
                    data-testid="feedback-attachment"
                    type="file"
                    multiple
                    accept="image/*,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600/10 file:px-3 file:py-1 file:text-brand-600 file:cursor-pointer file:font-medium"
                  />
                  <p className="text-xs text-text-tertiary">
                    Up to {MAX_FILES} files, 10 MB each
                  </p>
                  {attachmentError && (
                    <p role="alert" className="text-error text-xs">
                      {attachmentError}
                    </p>
                  )}
                  {attachments.length > 0 && (
                    <ul className="flex flex-col gap-1 mt-1">
                      {attachments.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={
                              item.error ? "text-error" : "text-text-secondary"
                            }
                          >
                            {item.file.name}{" "}
                            ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                            {item.error && ` — ${item.error}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="text-error hover:opacity-70 focus:outline-none focus-visible:ring-1 focus-visible:ring-error"
                            aria-label={`Remove ${item.file.name}`}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* API error */}
                {modalState === "error" && apiError && (
                  <div
                    role="alert"
                    data-testid="feedback-error-banner"
                    className="rounded-xl bg-error-surface px-4 py-3 flex flex-col gap-1"
                  >
                    <p className="text-error font-semibold text-sm">
                      Something went wrong
                    </p>
                    <p className="text-error text-xs">{apiError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="button"
                    data-testid="feedback-cancel"
                    onClick={closeModal}
                    className="min-h-[44px] px-4 py-2 rounded-xl font-medium text-text-secondary hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    Cancel
                  </button>

                  {modalState === "error" ? (
                    <button
                      type="button"
                      data-testid="feedback-retry"
                      onClick={handleRetry}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      Retry
                    </button>
                  ) : (
                    <button
                      type="submit"
                      data-testid="feedback-submit"
                      disabled={modalState === "submitting" || hasAttachmentErrors}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      {modalState === "submitting" ? "Submitting..." : "Submit"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </dialog>
        </div>
      )}
    </>
  );
}
