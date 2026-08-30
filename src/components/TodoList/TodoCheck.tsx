import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import ApiError from "../../types/ApiError";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function TodoCheck({
  todoId,
  initialValue,
  onRefetch
}: Readonly<{
  todoId: string | null;
  initialValue: boolean;
  onRefetch: () => void;
}>) {
  const [completed, setCompleted] = useState<boolean>(initialValue);
  const debouncedComplete = useDebounce(completed);

  // Sends an update request to the server once the debouncedComplete value has been updated
  useUpdateEffect(() => {
    fetch(baseUrl + todoId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: completed }),
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error updating Todo", response.status);
        }
        onRefetch();
        console.log(`Request sent ${completed}`);
      })
      .catch((error: ApiError) => {
        alert(error.message);
      });
  }, [debouncedComplete]);

  return (
    <input
      type="checkbox"
      className="completion-check"
      checked={completed}
      onChange={(e) => setCompleted(e.target.checked)}
    />
  );
}
