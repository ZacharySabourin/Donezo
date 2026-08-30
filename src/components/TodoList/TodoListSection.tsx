import { useState } from "react";
import useFetchSortedTodos from "../../hooks/useFetchSortedTodos";
import ApiError from "../../types/ApiError";
import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";
import type Todo from "../../types/Todo";
import useUpdateEffect from "../../hooks/useUpdateEffect";

const userId: string = import.meta.env.VITE_USER_ID;
const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function TodoListSection() {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { todos, loading, error, refetch } = useFetchSortedTodos(
    userId,
    refreshTrigger,
  );

  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(todos);

  function handleDeleteAllCompleted() {
    const toDelete: Todo[] = todos.slice().filter((todo) => todo.completed);
    if (toDelete.length != 0) {
      fetch(baseUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toDelete),
      })
        .then((response: Response) => {
          if (!response.ok) {
            throw new ApiError("Error deleting Todos", response.status);
          }
          triggerRefresh();
        })
        .catch((error: ApiError) => {
          alert(error.message);
        });
    }
  }

  useUpdateEffect(() => {
    setFilteredTodos(() => {
      if (selectedFilter === "active") {
        return todos.slice().filter((todo) => !todo.completed);
      }
      if (selectedFilter === "completed") {
        return todos.slice().filter((todo) => todo.completed);
      }
      return todos;
    });
  }, [todos, selectedFilter]);

  return (
    <div id="todo-list">
      <CreationForm onSaveSuccess={triggerRefresh} />
      <ListDisplay
        todos={filteredTodos}
        loading={loading}
        error={error}
        refetch={refetch}
      />
      <div id="options">
        <p>{todos.length} items left</p>
        <form>
          <label className="list-filter">
            <input
              type="radio"
              name="choice"
              value="all"
              checked={selectedFilter === "all"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>All</span>
          </label>

          <label className="list-filter">
            <input
              type="radio"
              name="choice"
              value="active"
              checked={selectedFilter === "active"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>Active</span>
          </label>

          <label className="list-filter">
            <input
              type="radio"
              name="choice"
              value="completed"
              checked={selectedFilter === "completed"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>Completed</span>
          </label>
        </form>

        <button type="button" onClick={handleDeleteAllCompleted}>
          Clear all Completed
        </button>
      </div>
    </div>
  );
}
