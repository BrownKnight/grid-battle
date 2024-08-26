import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const NavButton = ({ to, color, children }: { to: string; color: string } & React.PropsWithChildren) => {
    return (
      <Link to={to} className={`h-32 p-4 rounded-full bg-${color}-600 hover:bg-${color}-700 active:bg-${color}-800 text-white text-center content-center`}>
        {children}
      </Link>
    );
  };
  return (
    <div className="flex flex-col grow">
      <div className="flex grow justify-center p-2">
        <div className="flex flex-col grow max-w-screen-sm gap-12 m-4 mt-16 text-2xl">
          <NavButton to="/battle" color="red">Battle Mode</NavButton>
          <NavButton to="/grid/random" color="teal">Play a Random Grid</NavButton>
        </div>
      </div>
    </div>
  );
}
