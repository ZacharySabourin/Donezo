import { useCallback, useEffect, useState } from "react";
import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";

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
import type { UserProfile } from "../services/AuthAPI";

/**
 * Return type for the useTodos() function. Contains a list of sorted Todos,
 * the list loading state, the list error state, as well as handler callbacks
 * for creation, updating, deletion and reordering of items in the list.
 */
interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: ApiError | null;
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

/**
 * Provides all handlers and state management for the master Todo list. Returns a UseTodoReturn object.
 * @param userId The current user's id
 * @returns A UseTodosReturn object
 */
export function useTodos(user: UserProfile | null): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Use a callback since the list fetch is asynchronous code
  const fetch: () => Promise<void> = useCallback(async () => {
    try {
      setLoading(true);
      const sortedTodos: Todo[] = await fetchSortedTodosApi();
      setTodos(sortedTodos);
    } catch (error) {
      setError(error as ApiError);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Triggers on component mount, and whenever the userId changes.
  useEffect(() => {
    fetch();
  }, [fetch]);

  // Handler for item creation. Triggers an alert on failure
  const handleCreateItem = async (payload: TodoRequest): Promise<void> => {
    try {
      const newTodo: Todo = await createTodoApi(payload);
      setTodos((prev: Todo[]) => {
        const updatedItems: Todo[] = [...prev];
        updatedItems.push(newTodo);
        return updatedItems;
      });
    } catch (error) {
      alert((error as ApiError).message);
    }
  };

  // Handler for single item update.
  const handleUpdateItem = async (
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
      alert((error as ApiError).message);
      // Revert to original value
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) =>
          todo.id === todoId ? { ...todo, ...originalValue } : todo,
        ),
      );
    }
  };

  // Handler for single item deletion.
  const handleDeleteItem = async (todoId: string): Promise<void> => {
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
      alert((error as ApiError).message);
      setTodos(snapshot);
    }
  };

  // Hanlder for multi-item deletion
  const handleDeleteAllCompleted = async (): Promise<void> => {
    const toDelete: Todo[] = todos.filter((todo: Todo) => todo.completed);
    if (toDelete.length === 0) {
      return;
    }

    // Capture snapshot of original items
    const originalItems: Todo[] = [...todos];

    // Prepare updates and reorder
    const { updates, reorderedItems } = reorderAndPrepareBulkUpdate(
      originalItems.filter((todo: Todo) => !todo.completed),
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
      alert((error as ApiError).message);
      setTodos(originalItems);
    }
  };

  // Handler for reordering after a drag and drop
  const handleReorder = async (
    draggedId: string,
    targetId: string,
  ): Promise<void> => {
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
      alert((error as ApiError).message);
      setTodos(snapshot);
    }
  };

  return {
    todos,
    loading,
    error,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
  };
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
