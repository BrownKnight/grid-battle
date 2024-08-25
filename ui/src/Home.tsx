import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const NavButton = ({ to, children }: { to: string } & React.PropsWithChildren) => {
    return (
      <Link to={to} className="h-16 p-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-center content-center">
        {children}
      </Link>
    );
  };
  return (
    <div className="flex flex-col max-w-screen-md mx-auto gap-4 mt-4">
      <NavButton to="/battle">Create a Battle</NavButton>
      <NavButton to="/battle">Join a Battle</NavButton>
      <NavButton to="/grid/random">Random Grid</NavButton>
    </div>
  );
}
