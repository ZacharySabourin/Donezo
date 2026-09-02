import { useState } from "react";
import useFetchSortedTodos from "../../hooks/useFetchSortedTodos";
import useUpdateEffect from "../../hooks/useUpdateEffect";
import type Todo from "../../types/Todo";
import type {
  BulkTodoPositionUpdate,
  TodoCompletionUpdate,
  TodoTextUpdate,
} from "../../types/TodoUpdates";
import {
  deleteTodo,
  deleteTodoList,
  updateTodo,
  updateTodos,
} from "../../utils/TodoAPI";
import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";

const userId: string = import.meta.env.VITE_USER_ID;

export default function TodoListSection() {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { todos, setTodos, loading, error } = useFetchSortedTodos(
    userId,
    refreshTrigger,
  );

  const [todoCount, setTodoCount] = useState<number>(todos.length);
  const [todosToDisplay, setTodosToDisplay] = useState<Todo[]>(todos);

  const handleDeleteAllCompleted = async () => {
    const toDelete: Todo[] = todos.slice().filter((todo) => todo.completed);
    if (toDelete.length != 0) {
      const originalValues = [...todos];
      const updatedItems = todos.slice().filter((todo) => !todo.completed);

      const bulkUpdates: BulkTodoPositionUpdate[] = [];
      let newPosition: number = 0;
      updatedItems.forEach((todo) => {
        if (todo.position != newPosition) {
          const update: BulkTodoPositionUpdate = {
            id: todo.id,
            position: newPosition,
          };
          todo.position = newPosition;
          bulkUpdates.push(update);
        }
        newPosition++;
      });

      setTodos(updatedItems);

      try {
        await deleteTodoList(toDelete);
        if (bulkUpdates.length != 0) {
          await updateTodos(bulkUpdates);
        }
      } catch (error) {
        setTodos(originalValues);
        // TODO: trigger error message
      }
    }
  };

  const handleUpdateItem = async (
    todoId: string,
    originalValue: TodoCompletionUpdate | TodoTextUpdate,
    update: TodoCompletionUpdate | TodoTextUpdate,
  ) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, ...update } : todo)),
    );

    try {
      await updateTodo(todoId, update);
    } catch (error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, ...originalValue } : todo,
        ),
      );
      // TODO: trigger error message
    }
  };

  const handleDeleteItem = async (todoId: string) => {
    const originalValues = [...todos];
    const updatedItems = todos.slice();

    // Remove the item from the updated list
    const index: number = updatedItems.findIndex((todo) => todo.id === todoId);
    updatedItems.splice(index, 1);

    // Starting at the removed item's position, shift every position down by 1 to compensate
    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    for (let i = index; i < updatedItems.length; i++) {
      updatedItems[i].position -= 1;

      // Prepare the updates for the API
      const update: BulkTodoPositionUpdate = {
        id: updatedItems[i].id,
        position: updatedItems[i].position,
      };
      bulkUpdates.push(update);
    }

    setTodos(updatedItems);

    try {
      await deleteTodo(todoId);
      if (bulkUpdates.length != 0) {
        await updateTodos(bulkUpdates);
      }
    } catch (error) {
      setTodos(originalValues);
      // TODO: Trigger error message
    }
  };

  useUpdateEffect(() => {
    setTodosToDisplay(() => {
      let display = [];
      if (selectedFilter === "active") {
        display = todos.slice().filter((todo) => !todo.completed);
      } else if (selectedFilter === "completed") {
        display = todos.slice().filter((todo) => todo.completed);
      } else {
        display = todos;
      }
      setTodoCount(display.length);
      return display;
    });
  }, [todos, selectedFilter]);

  return (
    <div id="todo-list">
      <CreationForm todoCount={todoCount} onSaveSuccess={triggerRefresh} />
      <ListDisplay
        todos={todosToDisplay}
        loading={loading}
        error={error}
        handleUpdateItem={handleUpdateItem}
        handleDeleteItem={handleDeleteItem}
        setTodos={setTodos}
      />
      <div id="options">
        <p>{todoCount} items left</p>
        <form>
          <label className="list-filter">
            <input
              type="radio"
              name="filter"
              value="all"
              checked={selectedFilter === "all"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>All</span>
          </label>

          <label className="list-filter">
            <input
              type="radio"
              name="filter"
              value="active"
              checked={selectedFilter === "active"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>Active</span>
          </label>

          <label className="list-filter">
            <input
              type="radio"
              name="filter"
              value="completed"
              checked={selectedFilter === "completed"}
              onChange={(e) => setSelectedFilter(e.target.value)}
            />
            <span>Completed</span>
          </label>
        </form>

        <button type="button" onClick={handleDeleteAllCompleted}>
          Clear all Completed
        </button>
      </div>
    </div>
  );
}
