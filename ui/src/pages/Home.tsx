import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListGrids from "../grid/ListGrids";
import { LuPlus, LuSwords } from "react-icons/lu";
import { BiShuffle } from "react-icons/bi";
import SearchGrids from "../grid/SearchGrids";
import { UserContext } from "../UserContext";

export default function Home() {
  const navigate = useNavigate();
  const { showLogin } = useContext(UserContext);

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
    <div className="flex flex-col grow mb-8">
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

      <div className="flex justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl text-center my-2">Recent NYT Grids</h1>
          <ListGrids pageSize={5} source="NYT" onGridChosen={(gridId) => navigate(`/grid/${gridId}`)} />
        </div>
      </div>

      <div className="flex justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl text-center my-2">Find a Grid</h1>
          <SearchGrids pageSize={5} onGridChosen={(gridId) => navigate(`/grid/${gridId}`)} />
        </div>
      </div>

      <div className="flex justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl my-2">About Grid Battle</h1>
          <p>
            Based on the popular Connecting Wall round from the UK BBC game show Only Connect, and similar derivatives such as NYT
            Connections, Grid Battle faces you with a 4x4 grid of words, which can be grouped in to 4 categories.
          </p>
          <br />
          <p>
            In Grid Battle, not only can you solve grids and see how you fare on the leaderboard, you can also enter live Battle Rooms to
            compete in real time against your friends.{" "}
            <Link className="text-sky-400 hover:text-sky-600" to="/battle">
              Battle Mode
            </Link>{" "}
            allows you to play any grid, and tracks players scores across rounds to find the overall winner.
          </p>

          <h2 className="font-semibold text-xl mt-8 mb-2">How to Play</h2>
          <p>
            When playing grids, you have unlimited attempts to find the 4 categories. Each incorrect attempt results in a 10 second penalty
            to your time. The goal is to solve the grid in the fastest time, including all penalties.
          </p>

          <h2 className="font-semibold text-xl mt-8 mb-2">Leaderboards</h2>
          <p>
            The first time you complete a grid (outside of Battle Mode), your time will be saved and entered in to the Leaderboard. To save
            your time to the leaderboard, you must be{" "}
            <a href="#" onClick={showLogin} className=" text-sky-400 hover:text-sky-600">
              logged in.
            </a>
          </p>

          <h2 className="font-semibold text-xl mt-8 mb-2">Create your own Grid</h2>
          <p>
            You can{" "}
            <Link className="text-sky-400 hover:text-sky-600" to="/grid/create">
              Create your own Grid
            </Link>{" "}
            and have it be played anyone in the community.
          </p>
          <br />
          <p>
            When creating your own Grid, it's important to ensure that there is only one correct solution to the grid. Red herrings are a
            popular way to make grids more difficult, however it's important to ensure that the red herring still results in a single
            solution for the whole grid, even if one of the categories individually may have multiple soutions.
          </p>
          <br />
          <p>
            For example, consider the following two categories:
            <ul className="list-inside list-disc my-2">
              <li>
                <strong>Colours:</strong> Red, Blue, Orange, Green
              </li>
              <li>
                <strong>Golf Terms:</strong> Putter, Buggy, Fairway, Iron
              </li>
            </ul>
            The word <em>Green</em> could be considered valid in both categories. However, the other 4 words in the{" "}
            <strong>Golf Terms</strong> category do not cross over with the <strong>Colours</strong> category, which means there is only one
            possible complete solution.
          </p>

          <h2 className="font-semibold text-xl mt-8 mb-2">Open Source</h2>
          <p>
            Grid Battle is Open Source, check out the <a className="text-sky-400 hover:text-sky-600" href="https://github.com/BrownKnight/grid-battle">GitHub repo</a> to see how it
            works, or raise any issues you find. Contributions are welcome.
          </p>
        </div>
      </div>
    </div>
  );
}
