import { useState } from "react";
import type ApiError from "../../types/ApiError";
import type Todo from "../../types/Todo";

import type { TodoCompletionUpdate, TodoTextUpdate } from "../../services/TodoAPI";
import ErrorMessage from "../ErrorMessage";
import LoadingPlaceholder from "../LoadingPlaceholder";
import TodoItem from "./TodoItem";

type ListDisplayProps = Readonly<{
  todos: Todo[];
  loading: boolean;
  error: ApiError | null;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  handleDeleteItem: (todoId: string) => Promise<void>;
  onReorder: (draggedId: string, targetId: string) => Promise<void>;
}>;

export default function ListDisplay({
  todos,
  loading,
  error,
  handleUpdateItem,
  handleDeleteItem,
  onReorder,
}: ListDisplayProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Caputure drag and hover ids on start
  const handleDragStart = (id: string) => {
    setDraggedId(id);
    setHoveredId(id);
  };

  // Update hoveredId as the dragged item gets moves over others.
  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    if (!draggedId) {
      return;
    }

    setHoveredId(targetId);
  };

  const handleDragEnd = async () => {
    // No updates needed if item ends up in original position
    if (!draggedId || !hoveredId || draggedId === hoveredId) {
      return;
    }

    const activeDraggedId = draggedId;
    const activeHoveredId = hoveredId;

    // Reset values and set the saving state to true to prevent dragging while syncing with the server.
    setDraggedId(null);
    setHoveredId(null);
    setIsSaving(true);

    await onReorder(activeDraggedId, activeHoveredId);
    setIsSaving(false);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }
  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div id="list-display" className="flex-column-start">
      {todos.map((todo: Todo) => {
        return (
          <div
            key={todo.id}
            className="row-item-wrapper flex-row-start"
            onDragOver={(e) => handleDragOver(e, todo.id)}
          >
            <TodoItem
              todo={todo}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
            />
            <div
              className="drag-indicator"
              draggable={!isSaving}
              onDragStart={() => handleDragStart(todo.id)}
              onDragEnd={handleDragEnd}
              onMouseDown={(e) => {
                if (!isSaving) e.currentTarget.style.cursor = "grabbing";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.cursor = "grab";
              }}
            >
              ☰
            </div>
          </div>
        );
      })}
    </div>
  );
}
