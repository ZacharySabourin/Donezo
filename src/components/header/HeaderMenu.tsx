import { useAuthContext } from "../../hooks/useAuthContext";

export default function HeaderMenu() {
  const { user, logout } = useAuthContext();
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
