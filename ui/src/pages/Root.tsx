import { Outlet, useNavigate } from "react-router-dom";
import ErrorContextProvider from "../ErrorContext";
import UserContextProvider, { UserContext } from "../UserContext";
import { RxAvatar } from "react-icons/rx";
import { useContext } from "react";

export default function Root() {
  const navigate = useNavigate();
  return (
    <ErrorContextProvider>
      <UserContextProvider>
        <div className="flex flex-col min-h-svh box-border dark dark:bg-slate-900 text-black dark:text-gray-200">
          <div className="flex flex-row text-center w-100 h-12 self-stretch items-center justify-center bg-orange-400 text-black">
            <a href="#" onClick={() => navigate("/")} className="text-lg font-semibold">
              Grid Battle
            </a>
            <Avatar />
          </div>

          <div className="flex flex-col self-stretch grow">
            <Outlet />
          </div>
        </div>
      </UserContextProvider>
    </ErrorContextProvider>
  );
}

function Avatar() {
  const { showLogin } = useContext(UserContext);

  return (
    <a href="#" className="fixed right-4" onClick={showLogin}>
      <RxAvatar />
    </a>
  );
}
