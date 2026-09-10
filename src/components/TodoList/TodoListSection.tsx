import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";
import ListOptions from "./ListOptions";

export default function TodoListSection() {
  return (
    <>
      <CreationForm />
      <ListDisplay />
      <hr className="width-60" />
      <ListOptions />
    </>
  );
}
