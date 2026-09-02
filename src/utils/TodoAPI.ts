import ApiError from "../types/ApiError";
import type Todo from "../types/Todo";
import type {
  BulkTodoPositionUpdate,
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../types/TodoUpdates";

const baseUrl: string = import.meta.env.VITE_SERVER_API_BASE_URL;
const userId: string = import.meta.env.VITE_USER_ID;

export async function updateTodo(
  todoId: string,
  update: TodoCompletionUpdate | TodoTextUpdate,
): Promise<ApiError | void> {
  fetch(baseUrl + todoId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error updating Todo", response.status);
    }
  });
}

export async function updateTodos(
  updates: BulkTodoPositionUpdate[],
): Promise<ApiError | void> {
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

export async function deleteTodo(todoId: string) {
  fetch(baseUrl + userId + "?todoId=" + todoId, {
    method: "DELETE",
  }).then((response: Response) => {
    if (!response.ok) {
      throw new ApiError("Error deleting Todo", response.status);
    }
  });
}

export async function deleteTodoList(toDelete: Todo[]) {
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
