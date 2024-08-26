import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ListGrids from "./grid/ListGrids";

export default function Home() {
  const navigate = useNavigate();

  const NavButton = ({ to, color, children }: { to: string; color: string } & React.PropsWithChildren) => {
    return (
      <Link
        to={to}
        className={`h-16 p-4 rounded-full bg-${color}-600 hover:bg-${color}-700 active:bg-${color}-800 text-white text-center content-center`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="flex flex-col grow">
      <div className="flex justify-center p-2">
        <div className="flex flex-col grow max-w-screen-sm gap-4 px-4 pt-4 text-2xl">
          <NavButton to="/battle" color="red">
            Battle Mode
          </NavButton>
          <NavButton to="/grid/random" color="teal">
            Play a Random Grid
          </NavButton>
          <NavButton to="/grid/create" color="green">
            Create a Grid
          </NavButton>
        </div>
      </div>
      <div className="flex grow justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl text-center my-2">Recent NYT Grids</h1>
          <ListGrids pageSize={5} source="NYT" onGridChosen={(gridId) => navigate(`/grid/${gridId}`)}/>
        </div>
      </div>
    </div>
  );
}
