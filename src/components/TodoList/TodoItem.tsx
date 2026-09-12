import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useTodoDispatchContext } from "../../hooks/useTodoContext";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import type {
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../../services/todoAPI";
import type { Todo } from "../../types/todo";

export default function TodoItem({ todo }: Readonly<{ todo: Todo }>) {
  const [completed, setCompleted] = useState<boolean>(todo.completed);
  const [text, setText] = useState<string>(todo.text);
  const debouncedText = useDebounce<string>(text);

  const { handleUpdateItem, handleDeleteItem } = useTodoDispatchContext();

  // Synchronize state when the parent updates the todo prop
  useEffect(() => {
    setCompleted(todo.completed);
    setText(todo.text);
  }, [todo.completed, todo.text]);

  const handleCompletionChange = async (updatedValue: boolean) => {
    setCompleted(updatedValue);

    if (updatedValue !== todo.completed) {
      const original: TodoCompletionUpdate = { completed: todo.completed };
      const update: TodoCompletionUpdate = { completed: updatedValue };
      await handleUpdateItem(todo.id, original, update);
    }
  };

  // If there are any changes after debouncing, trigger the update handler
  useUpdateEffect(() => {
    const sendUpdate = async () => {
      if (debouncedText !== todo.text) {
        const original: TodoTextUpdate = { text: todo.text };
        const update: TodoTextUpdate = { text: debouncedText };
        await handleUpdateItem(todo.id, original, update);
      }
    };
    sendUpdate();
  }, [debouncedText]);

  return (
    <div className="row-item align-center flex-row-center">
      <input
        className="completion-check border-box interactive"
        type="checkbox"
        checked={completed}
        onChange={(e) => handleCompletionChange(e.target.checked)}
      />
      <input
        className="todo-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="round-btn height-100 gradient border-box interactive"
        type="button"
        onClick={() => handleDeleteItem(todo.id)}
      >
        Delete
      </button>
    </div>
  );
}
