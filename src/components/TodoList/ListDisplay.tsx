import { useState } from "react";
import type ApiError from "../../types/ApiError";
import type Todo from "../../types/Todo";
import type {
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../../types/TodoUpdates";
import ErrorMessage from "../ErrorMessage";
import LoadingPlaceholder from "../LoadingPlaceholder";
import TodoItem from "./TodoItem";

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

    // Remove from old position and insert into new position
    updatedItems[index].position = draggedItem.position;
    draggedItem.position = index;
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
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <TodoItem todo={todo} handleUpdateItem={handleUpdateItem} handleDeleteItem={handleDeleteItem}/>
          </div>
        );
      })}
    </div>
  );
}
