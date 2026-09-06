import { useCallback, useEffect, useRef, useState } from "react";
import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";
import type {
  BulkTodoPositionUpdate,
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../types/TodoUpdates";
import {
  deleteTodoApi,
  deleteTodoListApi,
  fetchSortedTodosApi,
  updateTodoApi,
  updateTodosApi,
} from "../utils/TodoAPI";

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: ApiError | null;
  triggerRefresh: () => void;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  handleDeleteItem: (todoId: string) => Promise<void>;
  handleDeleteAllCompleted: () => void;
  handleReorder: (draggedId: string, targetId: string) => Promise<void>;
}

export function useTodos(userId: string): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);

  const originalTodoValues = useRef<Todo[]>([]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const sortedTodos = await fetchSortedTodosApi(userId);
      setTodos(sortedTodos);
    } catch (error) {
      setError(error as ApiError);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Hook will auto-fire on mount, userId change, the refreshTrigger is updated, or refetch is called
  useEffect(() => {
    refetch();
  }, [refetch, refreshTrigger]);

  const handleUpdateItem = async (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    update: TodoCompletionUpdate | TodoTextUpdate,
  ) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, ...update } : todo)),
    );

    try {
      await updateTodoApi(todoId, update);
    } catch(error) {
      alert((error as Error).message);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, ...originalValue } : todo,
        ),
      );
    }
  };

  const handleDeleteItem = async (todoId: string) => {
    const updatedItems = structuredClone(todos);
    originalTodoValues.current = [...todos];

    const index = updatedItems.findIndex((todo) => todo.id === todoId);
    if (index === -1) {
      return;
    }

    updatedItems.splice(index, 1);

    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    for (let i = index; i < updatedItems.length; i++) {
      updatedItems[i].position -= 1;
      bulkUpdates.push({
        id: updatedItems[i].id,
        position: updatedItems[i].position,
      });
    }

    setTodos(updatedItems);

    try {
      await deleteTodoApi(userId, todoId);
      if (bulkUpdates.length > 0) {
        await updateTodosApi(bulkUpdates);
      }
    } catch(error) {
      alert((error as Error).message);
      setTodos(originalTodoValues.current);
    } finally {
      originalTodoValues.current = [];
    }
  };

  const handleDeleteAllCompleted = async () => {
    const toDelete = todos.filter((todo) => todo.completed);
    if (toDelete.length === 0) {
      return;
    }

    const updatedItems = structuredClone(
      todos.filter((todo) => !todo.completed),
    );
    originalTodoValues.current = [...todos];

    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    updatedItems.forEach((todo, index) => {
      if (todo.position !== index) {
        todo.position = index;
        bulkUpdates.push({ id: todo.id, position: index });
      }
    });

    setTodos(updatedItems);

    try {
      await deleteTodoListApi(toDelete);
      if (bulkUpdates.length > 0) {
        await updateTodosApi(bulkUpdates);
      }
    } catch(error) {
      alert((error as Error).message);
      setTodos(originalTodoValues.current);
    } finally {
      originalTodoValues.current = [];
    }
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) {
      return;
    }

    const originalMaster = [...todos];
    const draggedIndex = todos.findIndex((t) => t.id === draggedId);
    const targetIndex = todos.findIndex((t) => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const newMaster = [...todos];
    const [movedItem] = newMaster.splice(draggedIndex, 1);
    newMaster.splice(targetIndex, 0, movedItem);

    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    const updatedMaster = newMaster.map((todo, index) => {
      if (todo.position !== index) {
        bulkUpdates.push({ id: todo.id, position: index });
        return { ...todo, position: index };
      }
      return todo;
    });

    setTodos(updatedMaster);

    try {
      if (bulkUpdates.length > 0) {
        await updateTodosApi(bulkUpdates);
      }
    } catch(error) {
      alert((error as Error).message);
      setTodos(originalMaster);
    }
  };

  return {
    todos,
    loading,
    error,
    triggerRefresh,
    handleUpdateItem,
    handleDeleteItem,
    handleDeleteAllCompleted,
    handleReorder,
  };
}
