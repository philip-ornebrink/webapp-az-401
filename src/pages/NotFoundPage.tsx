import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        There's no page at this address. <Link to="/">Go to the objectives</Link>.
      </p>
    </>
  );
}
