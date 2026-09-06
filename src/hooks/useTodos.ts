import { useCallback, useEffect, useRef, useState } from "react";
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
} from "../utils/TodoAPI";

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
 * 
 * @param userId The current user's id
 * @returns A UseTodosReturn object
 */
export function useTodos(userId: string): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const originalTodoValues = useRef<Todo[]>([]);

  const fetch = useCallback(async () => {
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

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreateItem = async (payload: TodoRequest) => {
    try {
      const newTodo = await createTodoApi(payload);
      setTodos((prev) => {
        const updatedItems = [...prev];
        updatedItems.push(newTodo);
        return updatedItems;
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      alert((error as Error).message);
      setTodos(originalMaster);
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
