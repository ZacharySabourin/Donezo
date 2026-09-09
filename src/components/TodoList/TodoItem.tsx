import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import type Todo from "../../types/Todo";
import type { TodoCompletionUpdate, TodoTextUpdate } from "../../services/TodoAPI";

type TodoItemProps = Readonly<{
  todo: Todo;
  handleUpdateItem: (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    updates: TodoCompletionUpdate | TodoTextUpdate,
  ) => Promise<void>;
  handleDeleteItem: (todoId: string) => Promise<void>;
}>;

export default function TodoItem({
  todo,
  handleUpdateItem,
  handleDeleteItem,
}: TodoItemProps) {
  const [completed, setCompleted] = useState<boolean>(todo.completed);
  const [text, setText] = useState<string>(todo.text);
  const debouncedText = useDebounce<string>(text);

  // Synchronize state when the parent updates the todo prop
  useEffect(() => {
    setCompleted(todo.completed);
    setText(todo.text);
  }, [todo.completed, todo.text]);

  const handleCompletionChange = (updatedValue: boolean) => {
    setCompleted(updatedValue);

    if (updatedValue !== todo.completed) {
      const original: TodoCompletionUpdate = { completed: todo.completed };
      const update: TodoCompletionUpdate = { completed: updatedValue };
      handleUpdateItem(todo.id, original, update);
    }
  };

  // If there are any changes after debouncing, trigger the update handler
  useUpdateEffect(() => {
    if (debouncedText !== todo.text) {
      const original: TodoTextUpdate = { text: todo.text };
      const update: TodoTextUpdate = { text: debouncedText };
      handleUpdateItem(todo.id, original, update);
    }
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
