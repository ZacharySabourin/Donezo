import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const TABS = [
  {
    id: "login",
    label: "LOGIN",
  },
  {
    id: "signup",
    label: "SIGNUP",
  },
];

/**
 * Container shown to signed-out users that toggles between the
 * `LoginForm` and `SignupForm`, along with tabs to switch
 * between the two modes.
 */
export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const renderTabContent = () => {
    switch (activeTab) {
      case "login":
        return <LoginForm />;
      case "signup":
        return <SignupForm />;
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="auth-form-wrapper flex-column-start gap-40">
      <nav aria-label="Tabs">
        <div className="tab-row flex-row-start">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                className={`form-tab ${isActive ? "active" : ""}`}
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      {renderTabContent()}
    </div>
  );
}
