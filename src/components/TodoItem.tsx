import { useState } from "react";
import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";
import CompletionCheck from "./CompletionCheck";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function TodoItem({
  todo,
  onRefetch,
}: Readonly<{
  todo: Todo;
  onRefetch: () => void;
}>) {
  const [error, setError] = useState<ApiError | null>(null);
  const [completed, setCompleted] = useState(todo.completed);

  function handleCompletion(checked: boolean) {
    fetch(baseUrl + todo.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: null, position: null, completed: checked }),
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error updating Todo", response.status);
        }
        setCompleted(checked);
      })
      .catch((error: ApiError) => {
        alert(error.message);
        setError(error);
      });
  }

  function handleDelete() {
    fetch(baseUrl + todo.user_id + "?todoId=" + todo.id, {
      method: "DELETE",
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error deleting Todo", response.status);
        }
        onRefetch();
      })
      .catch((error: ApiError) => {
        alert(error.message);
        setError(error);
      });
  }

  return (
    <div>
      <CompletionCheck
        isCompleted={completed}
        completionCallback={handleCompletion}
      />
      <p>{todo.text}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
