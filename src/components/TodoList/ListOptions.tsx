import {
  useTodoDispatchContext,
  useTodoStateContext,
  type FilterType,
} from "@/context";

/**
 * Footer bar for the Todo list: shows a remaining-item count,
 * radio buttons for switching between the "All"/"Active"/"Completed"
 * filters, and a button to bulk-delete completed items.
 */
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
              onChange={() => {
                setSelectedFilter(filter);
              }}
            />
            <span>{filter}</span>
          </label>
        ))}
      </form>

      <button
        className="round-btn height-100 gradient border-box interactive"
        type="button"
        onClick={() => void handleDeleteAllCompleted()}
      >
        Clear Completed
      </button>
    </div>
  );
}
