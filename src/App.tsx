import "./App.css";
import TitleCard from "./components/TitleCard";
import TodoListSection from "./components/TodoList/TodoListSection";

const userId: string = import.meta.env.VITE_USER_ID;

function App() {
  // TODO: Add hook for user management
  return (
    <>
      <TitleCard />
      <TodoListSection userId={userId} />
    </>
  );
}

export default App;
