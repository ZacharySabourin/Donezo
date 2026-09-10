import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthForm() {
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
          onClick={() => setIsSignUp((prev) => !prev)}
          className="gradient border-box round-btn height-100 interactive width-50"
        >
          {isSignUp ? "Back to Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
}
