interface FeedbackProps {
  type: "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export function Feedback({ type, message, onDismiss }: FeedbackProps) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={`mb-4 flex items-center justify-between rounded-md p-4 text-sm ${
        isSuccess
          ? "border border-green-200 bg-green-50 text-green-800"
          : "border border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-3 cursor-pointer text-xs font-semibold uppercase tracking-wide hover:opacity-75"
          aria-label="Dismiss feedback"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

