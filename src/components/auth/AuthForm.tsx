import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import type ApiError from "../../types/ApiError";

export default function AuthForm() {
  const [newMember, setNewMember] = useState<boolean>(false);
  const toggleNewMember = () => setNewMember((prev) => !prev);
  const { login, signup } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // No request sent if the text is only spaces
    if (!username.trim() || !password.trim()) {
      return;
    }

    // TODO create popup banner for success message
    try {
      if (newMember) {
        await signup({ username, password });
      } else {
        await login({ username, password });
      }
    } catch (error) {
      alert((error as ApiError).message);
    } finally {
      setUsername("");
      setPassword("");
      setNewMember(false);
    }
  }

  return (
    <div className="auth-form-wrapper flex-column-start gap-20">
      <h2>{newMember ? "SIGN UP" : "LOGIN"}</h2>
      <form
        onSubmit={handleSubmit}
        className="flex-column-start align-center gap-20"
      >
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
        <hr className="width-60" />
        <button
          type="submit"
          className="gradient border-box round-btn height-100 interactive width-60"
        >
          {newMember ? "Create an Account" : "LOGIN"}
        </button>
      </form>
      <div>
        <button
          onClick={toggleNewMember}
          className="gradient border-box round-btn height-100 interactive width-50"
        >
          {newMember ? "Back to Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
}
