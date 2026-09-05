import { useEffect, useRef, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import type Todo from "../../types/Todo";
import type {
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../../types/TodoUpdates";

export default function TodoItem({
  todo,
  handleUpdateItem,
  handleDeleteItem,
}: Readonly<{
  todo: Todo;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => void;
  handleDeleteItem: (todoId: string) => void;
}>) {
  const [completed, setCompleted] = useState<boolean>(todo.completed);
  const debouncedComplete = useDebounce(completed);
  const originalComplete = useRef(todo.completed);

  const [text, setText] = useState<string>(todo.text);
  const debouncedText = useDebounce(text);
  const originalText = useRef(todo.text);

  useEffect(() => {
    setText(todo.text);
    originalText.current = todo.text;
  }, [todo.text]);

  useEffect(() => {
    setCompleted(todo.completed);
    originalComplete.current = todo.completed;
  }, [todo.completed]);

  useUpdateEffect(() => {
    const original: TodoCompletionUpdate = {
      completed: originalComplete.current,
    };
    const update: TodoCompletionUpdate = {
      completed: completed,
    };
    handleUpdateItem(todo.id, original, update);
  }, [debouncedComplete]);

  useUpdateEffect(() => {
    const original: TodoTextUpdate = {
      text: originalText.current,
    };
    const update: TodoTextUpdate = {
      text: text,
    };
    handleUpdateItem(todo.id, original, update);
  }, [debouncedText]);

  return (
    <div className="row-item flex-row-center">
      <input
        className="completion-check border-box interactive"
        type="checkbox"
        checked={completed}
        onChange={(e) => setCompleted(e.target.checked)}
      />
      <input
        className="todo-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="round-btn gradient border-box interactive"
        type="button"
        onClick={() => handleDeleteItem(todo.id)}
      >
        Delete
      </button>
    </div>
  );
}
