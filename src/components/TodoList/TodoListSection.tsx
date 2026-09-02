import { useRef, useState } from "react";
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

  const originalTodoValues = useRef<Todo[]>([]);

  const handleDeleteAllCompleted = async () => {
    const toDelete: Todo[] = todos.filter((todo) => todo.completed);
    if (toDelete.length != 0) {
      // Make a deep copy since we are mutating fields of items in the array
      const updatedItems = structuredClone(
        todos.filter((todo) => !todo.completed),
      );
      originalTodoValues.current = [...todos];

      const bulkUpdates: BulkTodoPositionUpdate[] = [];
      updatedItems.forEach((todo, index) => {
        if (todo.position != index) {
          todo.position = index;
          bulkUpdates.push({
            id: todo.id,
            position: index,
          });
        }
      });

      setTodos(updatedItems);

      try {
        await deleteTodoList(toDelete);
        if (bulkUpdates.length != 0) {
          await updateTodos(bulkUpdates);
        }
      } catch (error) {
        setTodos(originalTodoValues.current);
        // TODO: trigger error message
      } finally {
        originalTodoValues.current = [];
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
    // Make a deep copy since we are mutating fields of items in the array
    const updatedItems = structuredClone(todos);
    originalTodoValues.current = [...todos];

    // Remove the item from the updated list
    const index: number = updatedItems.findIndex((todo) => todo.id === todoId);
    updatedItems.splice(index, 1);

    // Starting at the removed item's position, shift every position down by 1 to compensate
    const bulkUpdates: BulkTodoPositionUpdate[] = [];
    for (let i = index; i < updatedItems.length; i++) {
      updatedItems[i].position -= 1;

      // Prepare the updates for the API
      bulkUpdates.push({
        id: updatedItems[i].id,
        position: updatedItems[i].position,
      });
    }

    setTodos(updatedItems);

    try {
      await deleteTodo(todoId);
      if (bulkUpdates.length != 0) {
        await updateTodos(bulkUpdates);
      }
    } catch (error) {
      setTodos(originalTodoValues.current);
      // TODO: Trigger error message
    } finally {
      originalTodoValues.current = [];
    }
  };

  // Filter trigger
  useUpdateEffect(() => {
    setTodosToDisplay(() => {
      let display = [...todos];
      if (selectedFilter === "active") {
        display = display.filter((todo) => !todo.completed);
      } else if (selectedFilter === "completed") {
        display = display.filter((todo) => todo.completed);
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
