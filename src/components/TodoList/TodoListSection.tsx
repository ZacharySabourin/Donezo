import { useState } from "react";
import useFetchSortedTodos from "../../hooks/useFetchSortedTodos";
import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";

const userId: string = import.meta.env.VITE_USER_ID;

export default function TodoListSection() {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);

  const { todos, loading, error, refetch } = useFetchSortedTodos(
    userId,
    refreshTrigger,
  );

  return (
    <div id="todo-list">
      <CreationForm onSaveSuccess={triggerRefresh} />
      <ListDisplay
        todos={todos}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    </div>
  );
}
