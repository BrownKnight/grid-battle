import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex flex-row min-h-svh items-stretch">
      <Outlet />
    </div>
  );
}
