import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import type ApiError from "../../types/ApiError";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // No request sent if the text is only spaces
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await login({ username, password });

      // Reset values
      setUsername("");
      setPassword("");
    } catch (error) {
      alert((error as ApiError).message);
    }
  }
  return (
    <div className="auth-form-wrapper flex-column-start gap-20">
      <form onSubmit={handleSubmit} className="flex-column-start align-center gap-20">
        <input
          className="todo-input width-60"
          type="text"
          placeholder="Enter username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="todo-input width-60"
          type="text"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <hr className="width-60"/>
        <button
          type="submit"
          className="gradient border-box round-btn height-100 interactive width-50"
        >
          Login
        </button>
      </form>
      <p>Create an account</p>
    </div>
  );
}
