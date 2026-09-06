import { useState } from "react";
import type TodoRequest from "../../types/TodoRequest";
import { createTodoApi } from "../../utils/TodoAPI";

type CreationFormProps = Readonly<{
  todoCount: number;
  userId: string;
  onSaveSuccess: () => void;
}>;

export default function CreationForm({
  todoCount,
  userId,
  onSaveSuccess,
}: CreationFormProps) {
  const [completed, setCompleted] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    const payload: TodoRequest = {
      user_id: userId,
      text,
      position: todoCount,
      completed,
    };

    try {
      await createTodoApi(payload);
      setText("");
      setCompleted(false);
      onSaveSuccess();
    } catch (error) {
      alert((error as Error).message);
    }
  }

  return (
    <div className="row-item-wrapper">
      <form onSubmit={handleSubmit} className="row-item flex-row-center">
        <input
          type="checkbox"
          className="completion-check round-btn border-box interactive"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
        <input
          className="todo-input"
          type="text"
          placeholder="Create a new Todo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form>
    </div>
  );
}
