import { useState } from "react";
import ApiError from "../../types/ApiError";
import type Todo from "../../types/Todo";
import TodoCheck from "./TodoCheck";
import TodoText from "./TodoText";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;
const userId: string = import.meta.env.VITE_USER_ID;

export default function TodoItem({
  todo,
  onRefetch,
}: Readonly<{
  todo: Todo;
  onRefetch: () => void;
}>) {
  const [error, setError] = useState<ApiError | null>(null);

  // Sends a deletion request to the server and triggers a refresh on the list if successful
  function handleDelete() {
    fetch(baseUrl + userId + "?todoId=" + todo.id, {
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
      <TodoCheck todoId={todo.id} initialValue={todo.completed} />
      <TodoText todoId={todo.id} initialValue={todo.text} />
      <button type="button" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}
