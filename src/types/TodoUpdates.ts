export interface TodoCompletionUpdate {
  completed: boolean;
}

export interface TodoTextUpdate {
  text: string;
}

export interface BulkTodoPositionUpdate {
  id: string,
  position: number
}
