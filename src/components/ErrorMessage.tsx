import type ApiError from "../types/ApiError";

export default function ErrorMessage({ error }: Readonly<{ error: ApiError | null }>) {
  return (
    <div className="error">
      <p>{error?.message} Status: {error?.statusCode}</p>
    </div>
  );
}
