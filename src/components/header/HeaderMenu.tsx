import {
  useAuthDispatchContext,
  useAuthStateContext,
} from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";

export default function HeaderMenu() {
  const { user } = useAuthStateContext();
  const { logout } = useAuthDispatchContext();
  const { showError } = useToastContext();

  const handleLogoutButton = async () => {
    try {
      await logout();
    } catch (error) {
      showError((error as Error).message || "Failed to Logout!");
    }
  };

  return (
    <div id="header" className="align-center">
      {user ? (
        <button
          className="round-btn border-box interactive height-100"
          onClick={() => handleLogoutButton()}
        >
          Logout
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
