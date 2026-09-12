import "./App.css";
import MainContent from "./components/MainContent";
import HeaderSection from "./components/header/HeaderSection";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HeaderSection />
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
