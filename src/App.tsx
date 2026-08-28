import { useState } from "react";
import "./App.css";
import CreationForm from "./components/CreationForm";
import TodoList from "./components/TodoList";
import useFetchSortedTodos from "./hooks/useFetchSortedTodos";

const userId: string = import.meta.env.VITE_USER_ID;

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const triggerRefresh = () => setRefreshTrigger((prev) => !prev);

  const { todos, loading, error, refetch } = useFetchSortedTodos(userId, refreshTrigger);

  return (
    <section id="center">
      <div>
        <h1>DONEZO</h1>
      </div>
      <CreationForm onSaveSuccess={triggerRefresh}/>
      <TodoList 
        todos={todos}
        loading={loading}
        error={error}
        refetch={refetch}
      />
    </section>
  );
}

export default App;
