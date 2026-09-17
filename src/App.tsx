import { AuthProvider, ToastProvider } from "@/context";
import "./App.css";
import MainContent from "@/components/MainContent";
import HeaderSection from "@/components/header/HeaderSection";

/**
 * Application root. Wires up the global `ToastProvider` and
 * `AuthProvider` context providers around the header and main
 * content areas.
 */
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
