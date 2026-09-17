import { useAsync } from "@/hooks";
import {
  ApiError,
  createTodoApi,
  deleteTodoApi,
  deleteTodoListApi,
  fetchSortedTodosApi,
  updateTodoApi,
  updateTodosApi,
} from "@/services";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  TodoDispatchContext,
  TodoStateContext,
  useToastContext,
  type BulkTodoPositionUpdate,
  type FilterType,
  type Todo,
  type TodoCompletionUpdate,
  type TodoDispatch,
  type TodoRequest,
  type TodoState,
  type TodoTextUpdate,
} from ".";

/**
 * Provides `TodoStateContext` and `TodoDispatchContext` to its
 * subtree. Fetches the current user's Todos on mount and exposes
 * CRUD + reorder handlers that optimistically update local state
 * and roll back on API failure. Must be rendered within a
 * `ToastProvider` (used to surface errors).
 */
export function TodoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const { showError } = useToastContext();

  // Logs and surfaces a toast when the initial Todo list fails to load.
  const handleListFetchError = useCallback(
    (error: Error) => {
      const apiError: ApiError = error as ApiError;
      console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
      showError(apiError.message);
    },
    [showError],
  );

  const {
    data,
    setData: setTodos,
    loading,
  } = useAsync<Todo[]>({
    asyncFn: fetchSortedTodosApi,
    onError: handleListFetchError,
  });

  // Protect against null data
  const todos: Todo[] = useMemo(() => {
    return data ?? [];
  }, [data]);

  // Used for snapshots in some of the callbacks
  const todosRef: React.RefObject<Todo[]> = useRef(todos);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

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
        setTodos((prev: Todo[] | null) => [...(prev ?? []), newTodo]);
      } catch (error) {
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        throw error;
      }
    },
    [setTodos],
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
      setTodos((prev: Todo[] | null) =>
        (prev ?? []).map((todo: Todo) =>
          todo.id === todoId ? { ...todo, ...update } : todo,
        ),
      );

      try {
        await updateTodoApi(todoId, update);
      } catch (error) {
        // Revert to original value
        setTodos((prev: Todo[] | null) =>
          (prev ?? []).map((todo: Todo) =>
            todo.id === todoId ? { ...todo, ...originalValue } : todo,
          ),
        );
        const apiError: ApiError = error as ApiError;
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        showError(apiError.message);
        throw error;
      }
    },
    [setTodos, showError],
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
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        showError(apiError.message);
      }
    },
    [setTodos, showError],
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
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        showError(apiError.message);
      }
    }, [setTodos, showError]);

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
        console.error(`${apiError.message}: ${String(apiError.statusCode)}`);
        showError(apiError.message);
      }
    },
    [setTodos, showError],
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
    <TodoStateContext value={stateContext}>
      <TodoDispatchContext value={dispatchContext}>
        {children}
      </TodoDispatchContext>
    </TodoStateContext>
  );
}

/**
 * Recomputes `position` for each item based on its index in `items`
 * and builds the minimal set of `BulkTodoPositionUpdate`s needed to
 * persist that reorder to the server (items whose position didn't
 * change are omitted).
 * @param items The Todos in their new desired order.
 * @returns The position updates to send to the server, and the
 * full list with positions already applied for optimistic UI updates.
 */
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
