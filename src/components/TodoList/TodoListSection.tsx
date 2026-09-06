import { useState } from "react";
import { useTodos } from "../../hooks/useTodos";
import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";

type FilterType = "All" | "Active" | "Completed";

export default function TodoListSection({
  userId,
}: Readonly<{ userId: string }>) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  const {
    todos,
    loading,
    error,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
  } = useTodos(userId);

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
    <div id="todo-list-section" className="flex-column-start">
      <CreationForm
        userId={userId}
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
      <hr />
      <div className="list-options row-item flex-row-center">
        <p>{filteredTodos.length} items left</p>
        <form className="filter-group flex-row-center">
          {(["All", "Active", "Completed"] as const).map(
            (filter: FilterType) => (
              <label
                key={filter}
                className="filter-choice gradient round-btn border-box interactive"
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
          className="round-btn gradient border-box interactive"
          type="button"
          onClick={handleDeleteAllCompleted}
        >
          Clear Completed
        </button>
      </div>
    </div>
  );
}
