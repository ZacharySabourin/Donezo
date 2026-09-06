import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;

/**
 * Outgoing creation request object
 */
export interface TodoRequest {
  user_id: string;
  text: string;
  position: number;
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoCompletionUpdate {
  completed: boolean;
}

/**
 * Outgoing update request object.
 */
export interface TodoTextUpdate {
  text: string;
}

/**
 * Outgoing update request object.
 */
export interface BulkTodoPositionUpdate {
  id: string;
  position: number;
}

export async function fetchSortedTodosApi(id: string): Promise<Todo[]> {
  return fetch(baseUrl + id)
    .then((response: Response) => {
      if (!response.ok) {
        throw new ApiError("Error fetching Todos!", response.status);
      }
      return response.json() as Promise<Todo[]>;
    })
    .then((result: Todo[]) => {
      return result.sort(
        (todoA: Todo, todoB: Todo) => todoA.position - todoB.position,
      );
    });
}

export async function createTodoApi(payload: TodoRequest): Promise<Todo> {
  return fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error creating new Todo", response.status);
    }
    return response.json() as Promise<Todo>;
  });
}

export async function updateTodoApi(
  todoId: string,
  updates: TodoCompletionUpdate | TodoTextUpdate,
): Promise<void> {
  fetch(baseUrl + todoId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error updating Todo", response.status);
    }
  });
}

export async function updateTodosApi(
  updates: BulkTodoPositionUpdate[],
): Promise<void> {
  fetch(baseUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error updating Todos", response.status);
    }
  });
}

export async function deleteTodoApi(userId: string, todoId: string) {
  fetch(baseUrl + userId + "?todoId=" + todoId, {
    method: "DELETE",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error deleting Todo", response.status);
    }
  });
}

export async function deleteTodoListApi(toDelete: Todo[]) {
  fetch(baseUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toDelete),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error deleting Todos", response.status);
    }
  });
}
