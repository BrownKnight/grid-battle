import { Link, useParams } from "react-router-dom";
import useApiClient from "../useApiClient";
import { useContext, useEffect, useState } from "react";
import { Leaderboard, LeaderboardEntry } from "../Models";
import { Select } from "flowbite-react";
import LeaderboardEntriesTable from "../leaderboard/LeaderboardEntriesTable";
import TimeDisplay from "../common/TimeDisplay";
import { UserContext } from "../UserContext";

export default function GridLeaderboard() {
  const apiClient = useApiClient();
  const { isLoggedIn } = useContext(UserContext);
  const { gridId } = useParams();

  const [myLeaderboardEntry, setMyLeaderboardEntry] = useState<LeaderboardEntry | undefined>(undefined);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [selectedLeaderboardId, setSelectedLeaderboardId] = useState("");

  useEffect(() => {
    apiClient
      .getMySubcribedLeaderboards()
      .then(({ json }) => {
        setLeaderboards(json);
        setSelectedLeaderboardId(json[0].leaderboardId);
      })
      .catch(() => {
        setLeaderboards([]);
        setSelectedLeaderboardId("");
      });
  }, [apiClient]);

  useEffect(() => {
    if (gridId && isLoggedIn) {
      apiClient
        .getMyLeaderboardEntryForGrid(gridId)
        .then(({ json }) => {
          setMyLeaderboardEntry(json);
        })
        .catch(() => {
          setMyLeaderboardEntry(undefined);
        });
    } else {
      setMyLeaderboardEntry(undefined);
    }
  }, [gridId, isLoggedIn, apiClient]);

  return (
    <div className="flex flex-col grow mt-4 mb-8">
      <h1 className="text-center text-lg font-semibold">Leaderboards</h1>
      <div className="flex justify-center p-2">
        <div className="grow max-w-screen-md">
          <Select value={selectedLeaderboardId} onChange={(e) => setSelectedLeaderboardId(e.target.value)}>
            {leaderboards.map((x) => (
              <option key={x.leaderboardId} value={x.leaderboardId}>
                {x.name} [{x.leaderboardId}]
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-center p-2">
        <div className="grow max-w-screen-md">
          <LeaderboardEntriesTable leaderboardId={selectedLeaderboardId} gridId={gridId!} />
        </div>
      </div>

      <div className="flex justify-center">
        {myLeaderboardEntry && (
          <span>
            Your time: <TimeDisplay totalTime={myLeaderboardEntry.totalTime} penalties={myLeaderboardEntry.penalties} />
          </span>
        )}
      </div>
      <div className="flex justify-center">
        {myLeaderboardEntry && (
          <span>
            Recorded at:{" "}
            {new Date(Date.parse(myLeaderboardEntry.createdDateTime)).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
          </span>
        )}
      </div>

      <div className="text-center mt-4">
        <Link  to="/leaderboards" className="text-sky-400 hover:text-sky-600">
          Create your own Leaderboard
        </Link>
        <span> to see how you fare against your friends.</span>
      </div>
    </div>
  );
}
