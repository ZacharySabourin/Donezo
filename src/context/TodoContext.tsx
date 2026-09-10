import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "../services/AuthAPI";
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
} from "../services/TodoAPI";
import type { FilterType, Todo, TodoContextType } from "../types/todo";

export const TodoContext = createContext<TodoContextType | null>(null);

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
      let snapshot: Todo[] = [];
      let updatesPayload: BulkTodoPositionUpdate[] = [];

      setTodos((prev) => {
        snapshot = prev;
        const copy = prev.filter((todo) => todo.id !== todoId);
        const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(copy);
        updatesPayload = updates;
        return reorderedItems;
      });

      try {
        await deleteTodoApi(todoId);

        // If the removed item is at the end, there won't be any updates here
        if (updatesPayload.length > 0) {
          await updateTodosApi(updatesPayload);
        }
      } catch (error) {
        // Revert to original snapshot
        setTodos(snapshot);
        throw error;
      }
    },
    [],
  );

  // Hanlder for multi-item deletion
  const handleDeleteAllCompleted = useCallback(async (): Promise<void> => {
    let snapshot: Todo[] = [];
    let toDelete: Todo[] = [];
    let updatesPayload: BulkTodoPositionUpdate[] = [];

    setTodos((prev) => {
      snapshot = prev;
      toDelete = prev.filter((todo) => todo.completed);
      if (toDelete.length === 0) {
        return prev;
      }

      const activeTodos = prev.filter((todo) => !todo.completed);
      const { updates, reorderedItems } =
        reorderAndPrepareBulkUpdate(activeTodos);
      updatesPayload = updates;
      return reorderedItems;
    });

    if (toDelete.length === 0) {
      return;
    }

    try {
      await deleteTodoListApi(toDelete);

      // If the removed items are at the end, there won't be any updates here
      if (updatesPayload.length > 0) {
        await updateTodosApi(updatesPayload);
      }
    } catch (error) {
      // Revert to original snapshot
      setTodos(snapshot);
      throw error;
    }
  }, []);

  // Handler for reordering after a drag and drop
  const handleReorder = useCallback(
    async (draggedId: string, targetId: string): Promise<void> => {
      if (draggedId === targetId) {
        return;
      }

      let snapshot: Todo[] = [];
      let updatesPayload: BulkTodoPositionUpdate[] = [];

      setTodos((prev) => {
        const draggedIndex = prev.findIndex((t) => t.id === draggedId);
        const targetIndex = prev.findIndex((t) => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
          return prev;
        }

        snapshot = prev;
        const copy = [...prev];
        const [movedItem] = copy.splice(draggedIndex, 1);
        copy.splice(targetIndex, 0, movedItem);

        const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(copy);
        updatesPayload = updates;
        return reorderedItems;
      });

      try {
        // If the item is dropped back to it's original position, this won't trigger
        if (updatesPayload.length > 0) {
          await updateTodosApi(updatesPayload);
        }
      } catch (error) {
        // Revert to original snapshot
        setTodos(snapshot);
        throw error;
      }
    },
    [],
  );

  const contextValue = useMemo(() => {
    return {
      todos,
      filteredTodos,
      selectedFilter,
      setSelectedFilter,
      loading,
      handleCreateItem,
      handleUpdateItem,
      handleDeleteItem,
      handleDeleteAllCompleted,
      handleReorder,
    };
  }, [
    todos,
    filteredTodos,
    selectedFilter,
    loading,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
  ]);

  return (
    <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
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
