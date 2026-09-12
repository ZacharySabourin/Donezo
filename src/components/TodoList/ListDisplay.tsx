import { useState } from "react";
import {
  useTodoDispatchContext,
  useTodoStateContext,
} from "../../hooks/useTodoContext";
import type { Todo } from "../../types/todo";
import LoadingSpinner from "../LoadingSpinner";
import TodoItem from "./TodoItem";

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
