import type {
  TodoCompletionUpdate,
  TodoRequest,
  TodoTextUpdate,
} from "../services/TodoAPI";

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

export type FilterType = "All" | "Active" | "Completed";

export interface TodoContextType {
  todos: Todo[];
  filteredTodos: Todo[];
  selectedFilter: FilterType;
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  loading: boolean;
  handleCreateItem: (payload: TodoRequest) => Promise<void>;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  handleDeleteItem: (todoId: string) => Promise<void>;
  handleDeleteAllCompleted: () => void;
  handleReorder: (draggedId: string, targetId: string) => Promise<void>;
}
