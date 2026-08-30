import { useState } from "react";
import ApiError from "../../types/ApiError";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;
const userId: string = import.meta.env.VITE_USER_ID;

export default function TodoDeleteButton({
  todoId,
  onRefetch,
}: Readonly<{
  todoId: string | null;
  onRefetch: () => void;
}>) {
  const [error, setError] = useState<ApiError | null>(null);

  // Sends a deletion request to the server and triggers a refresh on the list if successful
  function handleDelete() {
    fetch(baseUrl + userId + "?todoId=" + todoId, {
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
    <button type="button" onClick={handleDelete}>
      Delete
    </button>
  );
}
