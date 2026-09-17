import ThemeToggle from "./ThemeToggle";

/**
 * Displays the "DONEZO" app title alongside the light/dark
 * `ThemeToggle` control.
 */
export default function TitleCard() {
  return (
    <div id="title-card" className="flex-row-start align-center">
      <div className="title">
        <h1>DONEZO</h1>
      </div>
      <ThemeToggle />
    </div>
  );
}
