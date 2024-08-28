import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ListGrids from "./grid/ListGrids";
import { LuPlus, LuSwords } from "react-icons/lu";
import { BiShuffle } from "react-icons/bi";

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
            <span className="flex justify-center gap-2">
              <LuSwords className="h-8" />
              Battle Mode
            </span>
          </NavButton>
          <NavButton to="/grid/random" color="teal">
            <span className="flex justify-center gap-2">
              <BiShuffle className="h-8" />
              Play a Random Grid
            </span>
          </NavButton>
          <NavButton to="/grid/create" color="green">
            <span className="flex justify-center gap-2">
              <LuPlus className="h-8" />
              Create a Grid
            </span>
          </NavButton>
        </div>
      </div>
      <div className="flex grow justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl text-center my-2">Recent NYT Grids</h1>
          <ListGrids pageSize={5} source="NYT" onGridChosen={(gridId) => navigate(`/grid/${gridId}`)} />
        </div>
      </div>
    </div>
  );
}
