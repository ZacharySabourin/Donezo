import { useCallback, useEffect, useState } from "react";
import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function useFetchSortedTodos(
  userId: string,
  refreshTrigger: boolean,
): {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    fetch(baseUrl + userId)
      .then((response: Response) => {
        if (!response.ok) {
          throw new ApiError("Error fetching Todos!", response.status);
        }
        return response.json() as Promise<Todo[]>;
      })
      .then((result: Todo[]) => {
        result.sort(
          (todoA: Todo, todoB: Todo) => todoA.position - todoB.position,
        );
        setTodos(result);
      })
      .catch((error: ApiError) => setError(error))
      .finally(() => setLoading(false));
  }, [userId]);

  // Hook will auto-fire on mount, userId change, the refreshTrigger is updated, or refetch is called
  useEffect(() => {
    refetch();
  }, [refetch, refreshTrigger]);

  return { todos, setTodos, loading, error, refetch };
}
