import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTodos } from "../../hooks/useTodos";
import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";

type FilterType = "All" | "Active" | "Completed";

export default function TodoListSection() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const { user } = useAuth();

  // Destructure todos, load state, error state, and all handlers to pass down to child comonents
  const {
    todos,
    loading,
    error,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
  } = useTodos(user);

  // Filter list based on completion
  const filteredTodos = todos.filter((todo) => {
    if (selectedFilter === "Active") {
      return !todo.completed;
    }
    if (selectedFilter === "Completed") {
      return todo.completed;
    }
    return true;
  });

  return (
    <>
      <CreationForm
        todoCount={filteredTodos.length}
        handleCreateItem={handleCreateItem}
      />
      <ListDisplay
        todos={filteredTodos}
        loading={loading}
        error={error}
        handleUpdateItem={handleUpdateItem}
        handleDeleteItem={handleDeleteItem}
        onReorder={handleReorder}
      />
      <hr className="width-60" />
      <div className="list-options row-item flex-row-center">
        <p>{filteredTodos.length} items left</p>
        <form className="filter-group align-center flex-row-center">
          {(["All", "Active", "Completed"] as const).map(
            (filter: FilterType) => (
              <label
                key={filter}
                className="filter-choice align-center gradient round-btn height-100 border-box interactive"
              >
                <input
                  type="radio"
                  name="filter"
                  value={filter}
                  checked={selectedFilter === filter}
                  onChange={() => setSelectedFilter(filter)}
                />
                <span>{filter}</span>
              </label>
            ),
          )}
        </form>

        <button
          className="round-btn height-100 gradient border-box interactive"
          type="button"
          onClick={handleDeleteAllCompleted}
        >
          Clear Completed
        </button>
      </div>
    </>
  );
}
