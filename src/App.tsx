import { AuthProvider, ToastProvider } from "@/context";
import "./App.css";
import MainContent from "@/components/MainContent";
import HeaderSection from "@/components/header/HeaderSection";

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
