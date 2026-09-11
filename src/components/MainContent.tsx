import { TodoProvider } from "../context/TodoContext";
import { useAuthStateContext } from "../hooks/useAuthContext";
import AuthForm from "./auth/AuthForm";
import LoadingSpinner from "./LoadingSpinner";
import TodoListSection from "./TodoList/TodoListSection";

export default function MainContent() {
  const { user, loading } = useAuthStateContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-column-start main-content">
      {user ? (
        <TodoProvider user={user}>
          <TodoListSection />
        </TodoProvider>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
