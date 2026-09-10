import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import type ApiError from "../../types/ApiError";
import { useToastContext } from "../../hooks/useToastContext";

export default function SignupForm({
  buttonText,
}: Readonly<{ buttonText: string }>) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { signup } = useAuthContext();
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
    if (password !== confirmPassword) {
      showError("Passwords must match!");
      return;
    }
    if (username.length < 3) {
      showError("Username must be at least 3 characters!");
      return;
    }
    if (username.length > 40) {
      showError("Username cannot be longer than 40 characters!");
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters!");
    }
    if (password.length > 50) {
      showError("Password cannot be longer than 50 characters!");
    }

    try {
      await signup({ username, password });
      showSuccess(`Welcome, ${username}!`);
      setUsername("");
      setPassword("");
    } catch (error) {
      showError((error as ApiError).message || "Account creation failed!");
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
      <input
        className="todo-input width-60"
        type="password"
        placeholder="Confirm password..."
        autoComplete="current-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
