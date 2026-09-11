import {
  useAuthDispatchContext,
  useAuthStateContext,
} from "../../hooks/useAuthContext";

export default function HeaderMenu() {
  const { user } = useAuthStateContext();
  const { logout } = useAuthDispatchContext();

  return (
    <div id="header" className="align-center">
      {user ? (
        <button
          className="round-btn border-box interactive height-100"
          onClick={() => logout()}
        >
          Logout
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
