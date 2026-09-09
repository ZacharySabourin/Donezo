import { useAuth } from "../hooks/useAuth";
import AuthForm from "./auth/AuthForm";
import LoadingSpinner from "./LoadingSpinner";
import TodoListSection from "./TodoList/TodoListSection";

export default function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-column-start main-content">
      {user ? <TodoListSection /> : <AuthForm />}
    </div>
  );
}
