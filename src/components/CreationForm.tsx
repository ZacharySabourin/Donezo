import { useState } from "react";
import CompletionCheck from "./CompletionCheck";
import type Todo from "../types/Todo";
import ApiError from "../types/ApiError";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;
const userId: string = import.meta.env.VITE_USER_ID;

export default function CreationForm({
  onSaveSuccess,
}: Readonly<{
  onSaveSuccess: () => void;
}>) {
  const [completed, setCompleted] = useState(false);
  const [text, setText] = useState("");

  const [error, setError] = useState<ApiError | null>(null);

  function handleSubmit(e: any) {
    e.preventDefault();

    const newTodo: Todo = {
      user_id: userId,
      text: text,
      position: 0,
      completed: completed,
      created_at: null,
      id: null,
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
        onSaveSuccess();
      })
      .catch((error: ApiError) => {
        alert(error.message);
        setError(error);
      });
  }

  function handleCompletion(checked: boolean) {
    console.log(`Checkbox updated to ${checked}`);
    setCompleted(checked);
  }

  return (
    <div id="creation-form">
      <form onSubmit={handleSubmit} className="creation-form">
        <CompletionCheck
          isCompleted={completed}
          completionCallback={handleCompletion}
        />
        <input
          type="text"
          id="text-box"
          className="text-box"
          placeholder="Create a new Todo..."
          onChange={(e) => setText(e.target.value)}
        />
      </form>
    </div>
  );
}
