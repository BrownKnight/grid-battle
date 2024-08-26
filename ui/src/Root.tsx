import { Outlet, useNavigate } from "react-router-dom";

export default function Root() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-svh">
      <div className="flex flex-row text-center w-100 h-12 self-stretch content-center bg-orange-400" onClick={() => navigate("/")}>
        <h1 className="self-center mx-auto text-lg font-semibold">Grid Battle</h1>
      </div>

      <div className="flex flex-col self-stretch grow">
        <Outlet />
      </div>
    </div>
  );
}
