import HeaderMenu from "./HeaderMenu";
import TitleCard from "./TitleCard";

/**
 * App header, composed of the logout/menu controls (`HeaderMenu`)
 * and the app title/theme toggle (`TitleCard`).
 */
export default function HeaderSection() {
  return (
    <>
      <HeaderMenu />
      <TitleCard />
    </>
  );
}
