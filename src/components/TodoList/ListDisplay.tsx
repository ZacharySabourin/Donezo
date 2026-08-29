import type ApiError from "../../types/ApiError";
import type Todo from "../../types/Todo";
import ErrorMessage from "../ErrorMessage";
import LoadingPlaceholder from "../LoadingPlaceholder";
import TodoItem from "./TodoItem";

export default function ListDisplay({
  todos,
  loading,
  error,
  refetch,
}: Readonly<{
  todos: Todo[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}>) {
  if (loading) {
    return <LoadingPlaceholder />;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div id="list-display">
      {todos.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} onRefetch={refetch}/>
      ))}
    </div>
  );
}
