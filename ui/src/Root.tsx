import { Outlet, useNavigate } from "react-router-dom";
import ErrorContextProvider from "./ErrorContext";

export default function Root() {
  const navigate = useNavigate();
  return (
    <ErrorContextProvider>
      <div className="flex flex-col min-h-svh box-border dark dark:bg-slate-900 text-black dark:text-gray-200">
        <div className="flex flex-row text-center w-100 h-12 self-stretch content-center bg-orange-400 text-black" onClick={() => navigate("/")}>
          <h1 className="self-center mx-auto text-lg font-semibold">Grid Battle</h1>
        </div>

        <div className="flex flex-col self-stretch grow">
          <Outlet />
        </div>
      </div>
    </ErrorContextProvider>
  );
}
