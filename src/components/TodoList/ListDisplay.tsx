import { useState } from "react";
import { useToastContext } from "../../hooks/useToastContext";
import {
  useTodoDispatchContext,
  useTodoStateContext,
} from "../../hooks/useTodoContext";
import type ApiError from "../../types/ApiError";
import type { Todo } from "../../types/todo";
import LoadingSpinner from "../LoadingSpinner";
import TodoItem from "./TodoItem";

export default function ListDisplay() {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { showError } = useToastContext();
  const { filteredTodos, loading } = useTodoStateContext();
  const { handleReorder } = useTodoDispatchContext();

  // Capture drag and hover ids on start
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

    try {
      await handleReorder(activeDraggedId, activeHoveredId);
    } catch (error) {
      showError((error as ApiError).message || "Error reordering list!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div id="list-display" className="flex-column-start">
      {filteredTodos.map((todo: Todo) => {
        return (
          <div
            key={todo.id}
            className="row-item-wrapper flex-row-start"
            onDragOver={(e) => handleDragOver(e, todo.id)}
          >
            <TodoItem todo={todo} />
            <div
              className="drag-indicator align-center"
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
