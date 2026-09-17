import CreationForm from "./CreationForm";
import ListDisplay from "./ListDisplay";
import ListOptions from "./ListOptions";

/**
 * Composes the full authenticated Todo experience: the creation
 * form, the draggable list of items, and the filter/clear-completed
 * options bar. Expects to be rendered within a `TodoProvider`.
 */
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
