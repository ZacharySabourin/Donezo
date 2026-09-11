import { useState } from "react";
import { useAuthDispatchContext } from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";

export default function LoginForm({
  buttonText,
}: Readonly<{ buttonText: string }>) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = useAuthDispatchContext();
  const { showSuccess, showError } = useToastContext();

  const handleAuth = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      showError("Username is required!");
      return;
    }
    if (!password.trim()) {
      showError("Password is required!");
      return;
    }

    try {
      await login({ username, password });
      showSuccess("Welcome Back!");
      setUsername("");
      setPassword("");
    } catch (error) {
      showError((error as Error).message);
    }
  };

  return (
    <form
      onSubmit={handleAuth}
      className="flex-column-start align-center gap-20"
    >
      <input
        className="todo-input width-60"
        type="text"
        placeholder="Enter username..."
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="todo-input width-60"
        type="password"
        placeholder="Enter password..."
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <hr className="width-60" />
      <button
        type="submit"
        className="gradient border-box round-btn height-100 interactive width-60"
      >
        {buttonText}
      </button>
    </form>
  );
}
