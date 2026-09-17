/**
 * Simple centered CSS spinner used as a placeholder while async
 * data (auth session, Todo list, etc.) is being fetched.
 */
export default function LoadingSpinner() {
  return (
    <div className="spinner-container align-center">
      <div className="loading-spinner"></div>
    </div>
  );
}
