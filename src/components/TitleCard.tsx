import ThemeToggle from "./ThemeToggle";

export default function TitleCard() {
  return (
    <div id="title-card" className="flex-row-start">
      <div className="title">
        <h1>DONEZO</h1>
      </div>
      <ThemeToggle />
    </div>
  );
}
