import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "../services/authAPI";
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
import type { FilterType, Todo, TodoDispatch, TodoState } from "../types/todo";

export const TodoStateContext = createContext<TodoState | null>(null);
export const TodoDispatchContext = createContext<TodoDispatch | null>(null);

export function TodoProvider({
  user,
  children,
}: Readonly<{ user: UserProfile | null; children: ReactNode }>) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");

  // Use a callback since the list fetch is asynchronous code
  const fetch: () => Promise<void> = useCallback(async () => {
    try {
      setLoading(true);
      const sortedTodos: Todo[] = await fetchSortedTodosApi();
      setTodos(sortedTodos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [user?.id]);

  // Triggers on component mount, and whenever the userId changes.
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Filter the todos whenever the list or selected filter is updated
  const filteredTodos = useMemo(() => {
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

  // Handler for item creation. Triggers an alert on failure
  const handleCreateItem = useCallback(
    async (payload: TodoRequest): Promise<void> => {
      const newTodo: Todo = await createTodoApi(payload);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
    },
    [],
  );

  // Handler for single item update.
  const handleUpdateItem = useCallback(
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
        throw error;
      }
    },
    [],
  );

  // Handler for single item deletion.
  const handleDeleteItem = useCallback(
    async (todoId: string): Promise<void> => {
      const index: number = todos.findIndex((todo: Todo) => todo.id === todoId);
      if (index === -1) {
        return;
      }

      // Snapshot of original state
      const snapshot: Todo[] = [...todos];

      // Remove item
      const copy: Todo[] = [...todos];
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
        throw error;
      }
    },
    [todos],
  );

  // Handler for multi-item deletion
  const handleDeleteAllCompleted = useCallback(async (): Promise<void> => {
    const toDelete: Todo[] = todos.filter((todo: Todo) => todo.completed);
    if (toDelete.length === 0) {
      return;
    }

    // Capture snapshot of original items
    const snapshot: Todo[] = [...todos];

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
      throw error;
    }
  }, [todos]);

  // Handler for reordering after a drag and drop
  const handleReorder = useCallback(
    async (draggedId: string, targetId: string): Promise<void> => {
      if (draggedId === targetId) {
        return;
      }

      // Find each item
      const draggedIndex: number = todos.findIndex((t) => t.id === draggedId);
      const targetIndex: number = todos.findIndex((t) => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return;
      }

      const snapshot: Todo[] = [...todos];
      const copy: Todo[] = [...todos];

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
        throw error;
      }
    },
    [todos],
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
      handleReorder,
    };
  }, [
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
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
  const reorderedItems = items.map((todo: Todo, index: number) => {
    // Ensure the position is only changed if the item actually moved
    if (todo.position !== index) {
      updates.push({ id: todo.id, position: index });
      return { ...todo, position: index };
    }
    return todo;
  });

  return { updates, reorderedItems };
}
