import ThemeToggle from "./ThemeToggle";

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
