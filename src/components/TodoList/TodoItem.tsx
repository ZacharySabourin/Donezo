import {
  useTodoDispatchContext,
  type Todo,
  type TodoCompletionUpdate,
  type TodoTextUpdate,
} from "@/context";
import { useDebounce, useUpdateEffect } from "@/hooks";
import { useState } from "react";

export default function TodoItem({ todo }: Readonly<{ todo: Todo }>) {
  const [text, setText] = useState<string>(todo.text);
  const [prevTodoText, setPrevTodoText] = useState<string>(todo.text);
  const debouncedText = useDebounce<string>(text);
  const { handleUpdateItem, handleDeleteItem } = useTodoDispatchContext();

  // Compare the incoming prop against our cached prop state
  if (todo.text !== prevTodoText) {
    setPrevTodoText(todo.text);
    setText(todo.text);
  }

  const handleCompletionChange = async (updatedValue: boolean) => {
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
    void sendUpdate();
  }, [debouncedText]);

  return (
    <div className="row-item align-center flex-row-center">
      <input
        className="completion-check border-box interactive"
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => void handleCompletionChange(e.target.checked)}
      />
      <input
        className="todo-input"
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <button
        className="round-btn height-100 gradient border-box interactive"
        type="button"
        onClick={() => void handleDeleteItem(todo.id)}
      >
        Delete
      </button>
    </div>
  );
}
