import { useAuth } from "../hooks/useAuth";

export default function HeaderMenu() {
  const { user, logout } = useAuth();
  return (
    <div id="header" className="align-center">
      {user ? (
        <button
          className="round-btn border-box interactive height-100"
          onClick={logout}
        >
          Logout
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
