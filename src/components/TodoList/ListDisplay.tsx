import { useRef, useState } from "react";
import type ApiError from "../../types/ApiError";
import type Todo from "../../types/Todo";
import type {
  BulkTodoPositionUpdate,
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../../types/TodoUpdates";
import ErrorMessage from "../ErrorMessage";
import LoadingPlaceholder from "../LoadingPlaceholder";
import TodoItem from "./TodoItem";
import { updateTodos } from "../../utils/TodoAPI";

export default function ListDisplay({
  todos,
  loading,
  error,
  handleUpdateItem,
  handleDeleteItem,
  setTodos,
}: Readonly<{
  todos: Todo[];
  loading: boolean;
  error: ApiError | null;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => void;
  handleDeleteItem: (todoId: string) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const originalTodoValues = useRef<Todo[]>([]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    originalTodoValues.current = [...todos];
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setIsSaving(true);

    // Make a deep copy since we are mutating fields of items in the array
    const updatedItems = structuredClone(todos);

    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    updatedItems.forEach((todo, index) => {
      if (todo.position != index) {
        todo.position = index;
        bulkUpdates.push({
          id: todo.id,
          position: index,
        });
      }
    });

    setTodos(updatedItems);

    try {
      await updateTodos(bulkUpdates);
    } catch (error) {
      if (originalTodoValues.current) {
        setTodos(originalTodoValues.current);
      }
      // TODO: trigger error message
    } finally {
      setIsSaving(false);
      originalTodoValues.current = [];
    }
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();
    if (draggedIndex === index || draggedIndex === null) {
      return;
    }

    const updatedItems = [...todos];
    const draggedItem = updatedItems[draggedIndex];

    updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setTodos(updatedItems);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div id="list-display">
      {todos.map((todo: Todo, index) => {
        const isCurrentlyDragging = draggedIndex == index;
        return (
          <div
            key={todo.id}
            draggable={!isSaving}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <TodoItem
              todo={todo}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
            />
          </div>
        );
      })}
    </div>
  );
}
