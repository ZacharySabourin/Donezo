import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useToastContext } from "../hooks/useToastContext";
import {
  createTodoApi,
  deleteTodoApi,
  deleteTodoListApi,
  fetchSortedTodosApi,
  updateTodoApi,
  updateTodosApi,
  type BulkTodoPositionUpdate,
  type TodoCompletionUpdate,
  type TodoRequest,
  type TodoTextUpdate,
} from "../services/todoAPI";
import type ApiError from "../types/ApiError";
import type { FilterType, Todo, TodoDispatch, TodoState } from "../types/todo";

/**
 * State context. Called by the useTodoContext hook
 */
export const TodoStateContext = createContext<TodoState | null>(null);

/**
 * Dispatch context. Called by the useTodoContext hook
 */
export const TodoDispatchContext = createContext<TodoDispatch | null>(null);

export function TodoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  // Used for snapshots in some of the callbacks
  const todosRef: React.RefObject<Todo[]> = useRef(todos);
  todosRef.current = todos;

  const { showError } = useToastContext();

  // Fetch callback
  const fetch: () => Promise<void> = useCallback(async () => {
    try {
      setLoading(true);
      const sortedTodos: Todo[] = await fetchSortedTodosApi();
      setTodos(sortedTodos);
    } catch (error) {
      const apiError: ApiError = error as ApiError;
      console.error(`${apiError.message}: ${apiError.statusCode}`);
      showError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Triggers on component mount
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Filter the todos whenever the list or selected filter is updated
  const filteredTodos: Todo[] = useMemo(() => {
    return todos.filter((todo) => {
      if (selectedFilter === "Active") {
        return !todo.completed;
      }
      if (selectedFilter === "Completed") {
        return todo.completed;
      }
      return true;
    });
  }, [todos, selectedFilter]);

  // Handler for item creation. Error bubbled up to component to allow for form value retention
  const handleCreateItem: (payload: TodoRequest) => Promise<void> = useCallback(
    async (payload: TodoRequest): Promise<void> => {
      try {
        const newTodo: Todo = await createTodoApi(payload);
        setTodos((prev: Todo[]) => [...prev, newTodo]);
      } catch (error) {
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        throw error;
      }
    },
    [],
  );

  // Handler for single item update. Error bubbled up to component to allow for field value retention
  const handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    update: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void> = useCallback(
    async (
      todoId: string,
      originalValue: TodoCompletionUpdate | TodoTextUpdate,
      update: TodoCompletionUpdate | TodoTextUpdate,
    ): Promise<void> => {
      // Find relevant item and update value
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) =>
          todo.id === todoId ? { ...todo, ...update } : todo,
        ),
      );

      try {
        await updateTodoApi(todoId, update);
      } catch (error) {
        // Revert to original value
        setTodos((prev: Todo[]) =>
          prev.map((todo: Todo) =>
            todo.id === todoId ? { ...todo, ...originalValue } : todo,
          ),
        );
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        showError(apiError.message);
        throw error;
      }
    },
    [],
  );

  // Handler for single item deletion.
  const handleDeleteItem: (todoId: string) => Promise<void> = useCallback(
    async (todoId: string): Promise<void> => {
      const current: Todo[] = todosRef.current;
      const index: number = current.findIndex(
        (todo: Todo) => todo.id === todoId,
      );
      if (index === -1) {
        return;
      }

      // Snapshot of original state
      const snapshot: Todo[] = [...current];

      // Remove item
      const copy: Todo[] = [...current];
      copy.splice(index, 1);

      // Prepare updates and reorder
      const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(copy);
      setTodos(reorderedItems);

      try {
        await deleteTodoApi(todoId);

        // If the removed item is at the end, there won't be any updates here
        if (updates.length > 0) {
          await updateTodosApi(updates);
        }
      } catch (error) {
        // Revert to original snapshot
        setTodos(snapshot);
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        showError(apiError.message);
      }
    },
    [],
  );

  // Handler for multi-item deletion
  const handleDeleteAllCompleted: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      const current: Todo[] = todosRef.current;
      const toDelete: Todo[] = current.filter((todo: Todo) => todo.completed);
      if (toDelete.length === 0) {
        return;
      }

      // Capture snapshot of original items
      const snapshot: Todo[] = [...current];

      // Prepare updates and reorder
      const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(
        snapshot.filter((todo: Todo) => !todo.completed),
      );
      setTodos(reorderedItems);

      try {
        await deleteTodoListApi(toDelete);

        // If the removed items are at the end, there won't be any updates here
        if (updates.length > 0) {
          await updateTodosApi(updates);
        }
      } catch (error) {
        // Revert to original snapshot
        setTodos(snapshot);
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        showError(apiError.message);
      }
    }, []);

  // Handler for reordering after a drag and drop
  const handleDragReorder: (
    draggedId: string,
    targetId: string,
  ) => Promise<void> = useCallback(
    async (draggedId: string, targetId: string): Promise<void> => {
      if (draggedId === targetId) {
        return;
      }

      const current: Todo[] = todosRef.current;

      // Find each item
      const draggedIndex: number = current.findIndex((t) => t.id === draggedId);
      const targetIndex: number = current.findIndex((t) => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return;
      }

      const snapshot: Todo[] = [...current];
      const copy: Todo[] = [...current];

      // Swap item positions
      const [movedItem]: Todo[] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, movedItem);

      // Prepare updates and reorder
      const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(copy);
      setTodos(reorderedItems);

      try {
        // If the item is dropped back to it's original position, this won't trigger
        if (updates.length > 0) {
          await updateTodosApi(updates);
        }
      } catch (error) {
        // Revert to original snapshot
        setTodos(snapshot);
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${apiError.statusCode}`);
        showError(apiError.message);
      }
    },
    [],
  );

  const stateContext: TodoState = useMemo(() => {
    return { todos, filteredTodos, selectedFilter, loading };
  }, [todos, filteredTodos, selectedFilter, loading]);

  const dispatchContext: TodoDispatch = useMemo(() => {
    return {
      setSelectedFilter,
      handleCreateItem,
      handleUpdateItem,
      handleDeleteItem,
      handleDeleteAllCompleted,
      handleDragReorder,
    };
  }, [
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleDragReorder,
  ]);

  return (
    <TodoStateContext.Provider value={stateContext}>
      <TodoDispatchContext.Provider value={dispatchContext}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// Creates a new array with updated positions and prepares the update payload
function reorderAndPrepareBulkUpdate(items: Todo[]): {
  updates: BulkTodoPositionUpdate[];
  reorderedItems: Todo[];
} {
  const updates: BulkTodoPositionUpdate[] = [];
  const reorderedItems: Todo[] = items.map((todo: Todo, index: number) => {
    // Ensure the position is only changed if the item actually moved
    if (todo.position !== index) {
      updates.push({ id: todo.id, position: index });
      return { ...todo, position: index };
    }
    return todo;
  });

  return { updates, reorderedItems };
}
