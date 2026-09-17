import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

/**
 * Container shown to signed-out users that toggles between the
 * `LoginForm` and `SignupForm`, along with a button to switch
 * between the two modes.
 */
export default function AuthForm() {
  // Tracks whether the Signup form (true) or Login form (false) is shown.
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  return (
    <div className="auth-form-wrapper flex-column-start gap-20">
      <h2>{isSignUp ? "SIGN UP" : "LOGIN"}</h2>
      {isSignUp ? (
        <SignupForm buttonText="Create an Account" />
      ) : (
        <LoginForm buttonText="Login" />
      )}
      <div>
        <button
          onClick={() => {
            setIsSignUp((prev) => !prev);
          }}
          className="gradient border-box round-btn height-100 interactive width-50"
        >
          {isSignUp ? "Back to Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
}
