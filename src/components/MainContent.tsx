import { TodoProvider, useAuthStateContext } from "@/context";
import AuthForm from "./auth/AuthForm";
import LoadingSpinner from "./LoadingSpinner";
import TodoListSection from "./TodoList/TodoListSection";

/**
 * Top-level content area rendered below the header. Shows a loading
 * spinner while the current auth session is being resolved, the
 * authenticated Todo list (wrapped in its own `TodoProvider`) once a
 * user is logged in, or the login/signup form otherwise.
 */
export default function MainContent() {
  const { user, loading } = useAuthStateContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-column-start main-content">
      {user ? (
        <TodoProvider>
          <TodoListSection />
        </TodoProvider>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
