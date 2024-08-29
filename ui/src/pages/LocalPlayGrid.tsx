import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Category, Grid, LeaderboardEntry } from "../Models";
import { Button, Spinner } from "flowbite-react";
import TimedGrid from "../grid/TimedGrid";
import { ErrorContext } from "../ErrorContext";
import SimpleGrid from "../grid/SimpleGrid";
import GridTitle from "../grid/GridTitle";
import useApiClient from "../useApiClient";
import TimeDisplay from "../common/TimeDisplay";
import { UserContext } from "../UserContext";

export default function LocalPlayGrid() {
  const { gridId } = useParams();
  const { addError } = useContext(ErrorContext);
  const { isLoggedIn, showLogin } = useContext(UserContext);
  const apiClient = useApiClient();
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<Grid | undefined>(undefined);
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | undefined>(undefined);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [staticTime, setStaticTime] = useState<number | undefined>(undefined);
  const [penalties, setPenalties] = useState<number>(0);
  const [playing, setPlaying] = useState(false);

  const onCorrect = (_: Category, total: number) => {
    if (total === grid?.categories.length) {
      const totalTime = Date.now() - startTime + penalties * 10000;
      setStaticTime(totalTime);
    }
  };

  const onIncorrect = () => setPenalties((p) => ++p);

  useEffect(() => {
    if (!gridId) {
      setGrid(undefined);
      return;
    }

    setLoading(true);
    apiClient.getGrid(gridId).then(({ res, json }) => {
      if (res.status !== 200) {
        addError("Grid not found");
        return;
      }
      if (json) setGrid(json);
      setLoading(false);
      setStartTime(Date.now());
      setStaticTime(undefined);
      setPenalties(0);
      setPlaying(false);
    });
  }, [gridId, addError]);

  useEffect(() => {
    if (!gridId || !isLoggedIn) {
      setLeaderboardEntry(undefined);
      return;
    }

    apiClient.getLeaderboardEntryForGrid(gridId).then(({ res, json }) => {
      if (res.status !== 200) {
        return;
      }
      setLeaderboardEntry(json);
    });
  }, [isLoggedIn, gridId, apiClient]);

  useEffect(() => {
    // No leaderboard entry exists, so make one
    if (isLoggedIn && staticTime && !leaderboardEntry) {
      console.log("creating leaderboard entry");
      apiClient.createLeaderboardEntry(gridId!, staticTime, penalties).then(({ res, json }) => {
        if (res.ok && json) setLeaderboardEntry(json);
      });
    } else {
      console.log("Not making a new leaderboard entry", { isLoggedIn, staticTime, leaderboardEntry });
    }
  }, [leaderboardEntry, isLoggedIn, staticTime, gridId, penalties, apiClient]);

  const startGame = () => {
    setPlaying(true);
    setStartTime(Date.now());
    setStaticTime(undefined);
    setPenalties(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-8 text-lg gap-4">
        <Spinner size="lg" />
        <span>Loading Grid...</span>
      </div>
    );
  }

  if (!grid) {
    return <div>unknown error, no grid loaded</div>;
  }

  if (!playing) {
    return (
      <div className="flex flex-col grow">
        <div className="flex grow justify-center p-4">
          <div className="flex flex-col grow max-w-screen-md mx-auto">
            <GridTitle grid={grid} />

            <div className="mt-4 grow">
              <SimpleGrid grid={grid} matchedCount={0} />
            </div>

            {leaderboardEntry && (
              <span className="text-center mb-2">
                Your Leaderboard Time: <TimeDisplay totalTime={leaderboardEntry.totalTime} penalties={leaderboardEntry.penalties} />
              </span>
            )}

            <Button className="my-2" onClick={startGame}>Play Grid</Button>

            {isLoggedIn && <Link to={`/grids/${gridId}/leaderboard`}><Button color="dark" fullSized>View Leaderboard</Button></Link>}
          </div>
        </div>
      </div>
    );
  }

  const completedSection = (
    <div className="flex flex-col gap-2 text-center mb-4">
      <span>
        Well done! You completed the grid in <TimeDisplay totalTime={staticTime!} penalties={penalties} />, with a total of{" "}
        <span className="text-red-500">{penalties ?? 0}</span> mistakes.
      </span>
      {!isLoggedIn && (
        <span>
          <a href="#" onClick={showLogin} className="mx-1 text-sky-400 hover:text-sky-600">
            Login
          </a>
          to record this time on the leaderboard
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col grow mb-4">
      <div className="flex grow justify-center p-2">
        <div className="flex flex-col grow max-w-screen-md mx-auto">
          <TimedGrid
            grid={grid}
            startTime={startTime}
            staticTime={staticTime}
            interactive
            onCorrect={onCorrect}
            onIncorrect={onIncorrect}
            penalties={penalties}
          />
          {staticTime && completedSection}
          {isLoggedIn && <Link to=""><Button>View Leaderboard</Button></Link>}
        </div>
      </div>
    </div>
  );
}
