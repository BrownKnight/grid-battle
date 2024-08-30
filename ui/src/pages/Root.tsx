import { Outlet, useNavigate } from "react-router-dom";
import ErrorContextProvider from "../ErrorContext";
import UserContextProvider, { UserContext } from "../UserContext";
import { RxAvatar } from "react-icons/rx";
import { useContext } from "react";
import { Dropdown } from "flowbite-react";
import { HiLogout } from "react-icons/hi";

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
  const { isLoggedIn, showLogin, user, logout } = useContext(UserContext);

  if (isLoggedIn)
    return (
      <div className="absolute right-4">
        <Dropdown
          inline
          label={
            <div className="inline-flex gap-1">
              <RxAvatar size={24} />
              <span className="max-w-16 truncate">{user?.username}</span>
            </div>
          }
        >
          <Dropdown.Header>
            <span>Logged in as: </span>
            <span className="font-semibold">{user?.username}</span>
          </Dropdown.Header>
          <Dropdown.Item icon={HiLogout} onClick={logout}>Logout</Dropdown.Item>
        </Dropdown>
      </div>
    );

  return (
    <a href="#" className="absolute right-4 inline-flex items-center gap-1" onClick={showLogin}>
      <RxAvatar size={20} />
      <span>Login</span>
    </a>
  );
}
