import {
  useTodoDispatchContext,
  useTodoStateContext,
} from "../../hooks/useTodoContext";
import type { FilterType } from "../../types/todo";

export default function ListOptions() {
  const { filteredTodos, selectedFilter } = useTodoStateContext();
  const { setSelectedFilter, handleDeleteAllCompleted } =
    useTodoDispatchContext();

  return (
    <div className="list-options row-item flex-row-center">
      <p>{filteredTodos.length} items left</p>
      <form className="filter-group align-center flex-row-center">
        {(["All", "Active", "Completed"] as const).map((filter: FilterType) => (
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
        ))}
      </form>

      <button
        className="round-btn height-100 gradient border-box interactive"
        type="button"
        onClick={() => handleDeleteAllCompleted()}
      >
        Clear Completed
      </button>
    </div>
  );
}
