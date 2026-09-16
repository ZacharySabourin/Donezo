import type {
  BulkTodoPositionUpdate,
  Todo,
  TodoCompletionUpdate,
  TodoRequest,
  TodoTextUpdate,
} from "@/context";
import { ApiError, baseUrl } from ".";

/**
 * Fetches a list of Todos given the stored auth token in the browser by making a GET request.
 * Sorts them in ascending order based on position.
 * @returns A list of Todos sorted by position in ascending order.
 * @throws ApiError on failure to fetch
 */
export async function fetchSortedTodosApi(): Promise<Todo[]> {
  return fetch(`${baseUrl}/todos`, {
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
  })
    .then((response: Response) => {
      if (!response.ok) {
        throw new ApiError("Failed to fetch Todos!", response.status);
      }
      return response.json() as Promise<Todo[]>;
    })
    .then((result: Todo[]) => {
      return result.sort(
        (todoA: Todo, todoB: Todo) => todoA.position - todoB.position,
      );
    });
}

/**
 * Takes a payload and makes a POST request. Returns the newly persisted Todo entity.
 * @param payload The new values used to create a Todo entity.
 * @returns The newly created Todo object.
 * @throws ApiError on failure to create
 */
export async function createTodoApi(payload: TodoRequest): Promise<Todo> {
  return fetch(`${baseUrl}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Failed to create new Todo!", response.status);
    }
    return response.json() as Promise<Todo>;
  });
}

/**
 * Sends a PATCH request to update a Todo given the id and update object.
 * @param todoId The id to update
 * @param updates The updated fields
 * @throws ApiError on failure to update
 */
export async function updateTodoApi(
  todoId: string,
  updates: TodoCompletionUpdate | TodoTextUpdate,
): Promise<void> {
  return fetch(`${baseUrl}/todos/${todoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(updates),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Failed to update Todo!", response.status);
    }
  });
}

/**
 * Sends a PATCH request to update a list of todos. The payload consists of a list of update objects.
 * @param updates A list of updates to make.
 * @throws ApiError on failure to update
 */
export async function updateTodosApi(
  updates: BulkTodoPositionUpdate[],
): Promise<void> {
  return fetch(`${baseUrl}/todos`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(updates),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error reordering Todos!", response.status);
    }
  });
}

/**
 * Sends a DELETE request to delete a given Todo.
 * @param userId The current user's id
 * @param todoId The id of the Todo to delete
 * @throws ApiError on failure to delete
 */
export async function deleteTodoApi(todoId: string): Promise<void> {
  return fetch(`${baseUrl}/todos/${todoId}`, {
    method: "DELETE",
    headers: {
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Failed to delete item!", response.status);
    }
  });
}

/**
 * Sends a DELETE request to delete a list of Todos.
 * @param toDelete The Todos to delete.
 * @throws ApiError on failure to delete
 */
export async function deleteTodoListApi(toDelete: Todo[]): Promise<void> {
  return fetch(`${baseUrl}/todos`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getLatestCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(toDelete),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError(
        "Failed to delete all completed items!",
        response.status,
      );
    }
  });
}

/**
 * Read the latest token from the cookie dynamically right before a request
 * @returns The latest CSRF token
 */
function getLatestCsrfToken(): string {
  const match: RegExpMatchArray | null = /(?:^|; )XSRF-TOKEN=([^;]*)/.exec(
    document.cookie,
  );
  return match ? decodeURIComponent(match[1]) : "";
}
