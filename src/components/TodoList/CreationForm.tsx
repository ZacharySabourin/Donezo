import { useState } from "react";
import type { TodoRequest } from "../../services/TodoAPI";

type CreationFormProps = Readonly<{
  todoCount: number;
  handleCreateItem: (payload: TodoRequest) => Promise<void>;
}>;

export default function CreationForm({
  todoCount,
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
      <form onSubmit={handleSubmit} className="row-item align-center flex-row-center">
        <input
          type="checkbox"
          className="completion-check round-btn height-100 border-box interactive"
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
