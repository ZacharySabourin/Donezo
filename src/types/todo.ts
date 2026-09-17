/**
 * Todo object. Contains, text, position, completion check, and unique ids for itself and the user.
 */
export interface Todo {
  /** Unique identifier for the Todo, assigned by the server. */
  id: string;
  /** Identifier of the user that owns this Todo. */
  user_id: string;
  /** The Todo's display text. */
  text: string;
  /** Zero-based ordering index used to render/reorder the list. */
  position: number;
  /** Whether the Todo has been marked as done. */
  completed: boolean;
  /** Timestamp of when the Todo was created on the server. */
  created_at: Date;
}

/**
 * Outgoing creation request object
 */
export interface TodoRequest {
  /** The Todo's display text. */
  text: string;
  /** Zero-based ordering index for the new Todo (typically the current list length). */
  position: number;
  /** Initial completion state for the new Todo. */
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoCompletionUpdate {
  /** The new completion state to persist. */
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoTextUpdate {
  /** The new text to persist. */
  text: string;
}

/**
 * Outgoing update request object.
 */
export interface BulkTodoPositionUpdate {
  /** Identifier of the Todo whose position changed. */
  id: string;
  /** The Todo's new zero-based position. */
  position: number;
}

/**
 * Which subset of Todos should currently be displayed to the user.
 */
export type FilterType = "All" | "Active" | "Completed";

/**
 * State fields in TodoContext
 */
export interface TodoState {
  /** The full, unfiltered list of Todos for the current user. */
  todos: Todo[];
  /** `todos` narrowed down by `selectedFilter`. */
  filteredTodos: Todo[];
  /** The filter currently applied to `todos`. */
  selectedFilter: FilterType;
  /** Whether the initial Todo list is still being fetched. */
  loading: boolean;
}

/**
 * Dispatch callbacks used in TodoContext
 */
export interface TodoDispatch {
  /** Updates which filter is applied to the displayed list. */
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  /** Creates a new Todo, optimistically appending it once the server confirms. */
  handleCreateItem: (payload: TodoRequest) => Promise<void>;
  /**
   * Optimistically applies `updates` to the Todo identified by `todoId`,
   * reverting to `originalValue` if the server request fails.
   */
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  /** Deletes a single Todo and re-syncs the positions of the remaining items. */
  handleDeleteItem: (todoId: string) => Promise<void>;
  /** Deletes every completed Todo and re-syncs the positions of the remaining items. */
  handleDeleteAllCompleted: () => Promise<void>;
  /** Reorders the list by moving the dragged Todo to the target Todo's position. */
  handleDragReorder: (draggedId: string, targetId: string) => Promise<void>;
}
