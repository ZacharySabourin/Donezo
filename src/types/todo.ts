/**
 * Todo object. Contains, text, position, completion check, and unique ids for itself and the user.
 */
export interface Todo {
  id: string;
  user_id: string;
  text: string;
  position: number;
  completed: boolean;
  created_at: Date;
}

/**
 * Outgoing creation request object
 */
export interface TodoRequest {
  text: string;
  position: number;
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoCompletionUpdate {
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoTextUpdate {
  text: string;
}

/**
 * Outgoing update request object.
 */
export interface BulkTodoPositionUpdate {
  id: string;
  position: number;
}

export type FilterType = "All" | "Active" | "Completed";

/**
 * State fields in TodoContext
 */
export interface TodoState {
  todos: Todo[];
  filteredTodos: Todo[];
  selectedFilter: FilterType;
  loading: boolean;
}

/**
 * Dispatch callbacks used in TodoContext
 */
export interface TodoDispatch {
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  handleCreateItem: (payload: TodoRequest) => Promise<void>;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  handleDeleteItem: (todoId: string) => Promise<void>;
  handleDeleteAllCompleted: () => Promise<void>;
  handleDragReorder: (draggedId: string, targetId: string) => Promise<void>;
}
