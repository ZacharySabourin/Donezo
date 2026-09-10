import { useState } from "react";
import { useToastContext } from "../../hooks/useToastContext";
import { useTodoContext } from "../../hooks/useTodoContext";

export default function CreationForm() {
  const [completed, setCompleted] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const { showToast, showError } = useToastContext();
  const { todos, handleCreateItem } = useTodoContext();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!text.trim()) {
      showToast("Text cannot be empty!");
      return;
    }

    try {
      await handleCreateItem({
        text,
        position: todos.length,
        completed,
      });

      // Reset values
      setText("");
      setCompleted(false);
    } catch (error) {
      showError((error as Error).message || "Failed to create new item!");
    }
  }

  return (
    <div className="row-item-wrapper">
      <form
        onSubmit={handleSubmit}
        className="row-item align-center flex-row-center"
      >
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
