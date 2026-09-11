import { useContext } from "react";
import { AuthDispatchContext, AuthStateContext } from "../context/AuthContext";

export const useAuthStateContext = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthStateContext must be used within an AuthProvider");
  }
  return context;
};

export const useAuthDispatchContext = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error(
      "useAuthDispatchContext must be used within an AuthProvider",
    );
  }
  return context;
};
