import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import ApiError from "../../types/ApiError";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function TodoText({
  todoId,
  initialValue,
}: Readonly<{
  todoId: string | null;
  initialValue: string;
}>) {
  const [text, setText] = useState<string>(initialValue);
  const debouncedText = useDebounce(text);

  // Sends an update request to the server once the debouncedText value has been updated
  useUpdateEffect(() => {
    fetch(baseUrl + todoId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error updating Todo", response.status);
        }
        console.log(`Request sent ${text}`);
      })
      .catch((error: ApiError) => {
        alert(error.message);
      });
  }, [debouncedText]);

  return (
    <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
  );
}
