import "./App.css";
import HeaderMenu from "./components/HeaderMenu";
import MainContent from "./components/MainContent";
import TitleCard from "./components/TitleCard";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <HeaderMenu />
      <TitleCard />
      <MainContent />
    </AuthProvider>
  );
}

export default App;
