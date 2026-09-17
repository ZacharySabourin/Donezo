import {
  useTodoDispatchContext,
  useTodoStateContext,
  type Todo,
} from "@/context";
import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import TodoItem from "./TodoItem";

/**
 * Renders the filtered list of Todos and implements drag-and-drop
 * reordering. Each row exposes a drag handle; dropping a row over
 * another triggers `handleDragReorder` with the dragged/target ids.
 * Dragging is disabled while a reorder is being saved to the server.
 */
export default function ListDisplay() {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { filteredTodos, loading } = useTodoStateContext();
  const { handleDragReorder } = useTodoDispatchContext();

  // Capture drag and hover ids on start
  const handleDragStart = (id: string): void => {
    setDraggedId(id);
    setHoveredId(id);
  };

  // Update hoveredId as the dragged item gets moves over others.
  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ): void => {
    event.preventDefault();
    if (!draggedId) {
      return;
    }

    setHoveredId(targetId);
  };

  // Finalizes a drag operation by persisting the reorder to the server.
  const handleDragEnd = async (): Promise<void> => {
    // No updates needed if item ends up in original position
    if (!draggedId || !hoveredId || draggedId === hoveredId) {
      return;
    }

    const activeDraggedId: string = draggedId;
    const activeHoveredId: string = hoveredId;

    // Reset values and set the saving state to true to prevent dragging while syncing with the server.
    setDraggedId(null);
    setHoveredId(null);
    setIsSaving(true);

    await handleDragReorder(activeDraggedId, activeHoveredId);
    setIsSaving(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div id="list-display" className="flex-column-start">
      {filteredTodos.map((todo: Todo) => {
        const isDragging = draggedId === todo.id;
        const isHovered = hoveredId === todo.id && !isDragging;

        return (
          <div
            key={todo.id}
            className={`row-item-wrapper flex-row-start ${isDragging ? "is-dragging" : ""} ${isHovered ? "is-hovered" : ""}`}
            onDragOver={(e) => {
              handleDragOver(e, todo.id);
            }}
          >
            <TodoItem todo={todo} />
            <button
              type="button"
              className={`drag-indicator align-center ${isDragging ? "is-grabbing" : ""}`}
              aria-label={`Reorder ${todo.text}`}
              aria-roledescription="sortable handle"
              disabled={isSaving}
              draggable={!isSaving}
              onDragStart={() => {
                handleDragStart(todo.id);
              }}
              onDragEnd={() => void handleDragEnd()}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
