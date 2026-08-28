export default function CompletionCheck({
  isCompleted,
  completionCallback,
}: Readonly<{
  isCompleted: boolean;
  completionCallback: (arg0: boolean) => void;
}>) {
  return (
    <input
      type="checkbox"
      className="completion-check"
      checked={isCompleted}
      onChange={(e) => completionCallback(e.target.checked)}
    />
  );
}
