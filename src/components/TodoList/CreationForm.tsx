import { useState } from "react";
import ApiError from "../../types/ApiError";
import type TodoRequest from "../../types/TodoRequest";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;
const userId: string = import.meta.env.VITE_USER_ID;

export default function CreationForm({
  todoCount,
  onSaveSuccess,
}: Readonly<{
  todoCount: number;
  onSaveSuccess: () => void;
}>) {
  const [completed, setCompleted] = useState(false);
  const [text, setText] = useState("");

  const [error, setError] = useState<ApiError | null>(null);

  function handleSubmit(e: any) {
    e.preventDefault();

    const newTodo: TodoRequest = {
      user_id: userId,
      text: text,
      position: todoCount,
      completed: completed,
    };

    fetch(baseUrl + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error creating new Todo", response.status);
        }
        e.target.reset();
        setCompleted(false);
        onSaveSuccess();
      })
      .catch((error: ApiError) => {
        alert(error.message);
        setError(error);
      });
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
          onChange={(e) => setText(e.target.value)}
        />
      </form>
    </div>
  );
}
