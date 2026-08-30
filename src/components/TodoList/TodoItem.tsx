import type Todo from "../../types/Todo";
import TodoCheck from "./TodoCheck";
import TodoDeleteButton from "./TodoDeleteButton";
import TodoText from "./TodoText";



export default function TodoItem({
  todo,
  onRefetch,
}: Readonly<{
  todo: Todo;
  onRefetch: () => void;
}>) {
  

  return (
    <div>
      <TodoCheck todoId={todo.id} initialValue={todo.completed} onRefetch={onRefetch}/>
      <TodoText todoId={todo.id} initialValue={todo.text} onRefetch={onRefetch}/>
      <TodoDeleteButton todoId={todo.id} onRefetch={onRefetch}/>
    </div>
  );
}
