import { useState } from "react";
import type { TodoRequest } from "../../services/TodoAPI";

type CreationFormProps = Readonly<{
  todoCount: number;
  userId: string;
  handleCreateItem: (payload: TodoRequest) => Promise<void>;
}>;

export default function CreationForm({
  todoCount,
  userId,
  handleCreateItem,
}: CreationFormProps) {
  const [completed, setCompleted] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // No request sent if the text is only spaces
    if (!text.trim()) {
      return;
    }

    try {
      await handleCreateItem({
        user_id: userId,
        text,
        position: todoCount,
        completed,
      });

      // Reset values
      setText("");
      setCompleted(false);
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
