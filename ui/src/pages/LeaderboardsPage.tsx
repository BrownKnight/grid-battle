import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { Leaderboard } from "../Models";
import useApiClient from "../useApiClient";
import { Button, FloatingLabel, Spinner, Table } from "flowbite-react";
import { ErrorContext } from "../ErrorContext";
import { useMatch } from "react-router-dom";

export default function LeaderboardsPage() {
  const { isLoggedIn } = useContext(UserContext);
  const { addError } = useContext(ErrorContext);
  const match = useMatch("/leaderboards/:leaderboardId/join");
  const apiClient = useApiClient();

  const [loading, setLoading] = useState(false);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [newLeaderboardName, setNewLeaderboardName] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    apiClient.getMySubcribedLeaderboards().then(({ json }) => {
      if (json) setLeaderboards(json);

      setLoading(false);
    });
  }, [isLoggedIn, apiClient]);

  useEffect(() => {
    if (match?.params.leaderboardId && match?.params.leaderboardId.length === 4) {
      setJoinCode(match?.params.leaderboardId.toUpperCase());
    }
  }, [match?.params.leaderboardId]);

  const joinLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode || joinCode.length !== 6) {
      addError("Please provide a valid 6 character Leaderboard Code");
      return;
    }

    apiClient.joinLeaderboard(joinCode).then(({ json }) => {
      if (json) setLeaderboards(json);
      setJoinCode("");
    });
  };

  const createLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLeaderboardName || newLeaderboardName.length <= 4) {
      addError("Please provide a valid leaderboard name of at least 4 characters");
      return;
    }

    apiClient.createLeaderboard(newLeaderboardName).then(({ json }) => {
      if (json) setLeaderboards((x) => [...x, json]);
      setNewLeaderboardName("");
    });
  };

  if (!isLoggedIn) {
    return <div className="text-center mt-4">Please login to manage your leaderboard subscriptions</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center mx-auto mt-4">
        <Spinner />
        <span>Loading subscribed leaderboards...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow mb-4">
      <div className="flex justify-center p-2">
        <div className="flex flex-col grow max-w-screen-sm mx-auto">
          <h1 className="text-xl font-semibold my-4 text-center">My Subscribed Leaderboards</h1>
          <Table>
            <Table.Head>
              <Table.HeadCell>Code</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {leaderboards.map((leaderboard) => (
                <Table.Row key={leaderboard.leaderboardId}>
                  <Table.Cell className="font-mono">{leaderboard.leaderboardId}</Table.Cell>
                  <Table.Cell>{leaderboard.name}</Table.Cell>
                  <Table.Cell>
                    {leaderboard.leaderboardId !== "GLOBAL" && (
                      <Button
                        size="xs"
                        color="info"
                        outline
                        onClick={() => navigator.clipboard.writeText(`/leaderboards/join/${leaderboard.leaderboardId}`)}
                        fullSized
                      >
                        Copy Join Link
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <h1 className="text-xl font-semibold mt-16 mb-4 text-center">Join a Leaderboard</h1>
          <form onSubmit={joinLeaderboard}>
            <FloatingLabel
              variant="outlined"
              label="Leaderboard Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
              minLength={6}
              maxLength={6}
              helperText="Enter the Leaderboard Code of the leaderboard to join, to compare your times against everyone subscribed to that leaderboard."
            />
            <Button className="mt-4" type="submit" onClick={joinLeaderboard} fullSized>
              Join Leaderboard
            </Button>
          </form>

          <h1 className="text-xl font-semibold mt-16 mb-4 text-center">Create a Leaderboard</h1>
          <form onSubmit={createLeaderboard}>
            <FloatingLabel
              variant="outlined"
              label="New Leaderboard Name"
              value={newLeaderboardName}
              onChange={(e) => setNewLeaderboardName(e.target.value)}
              required
              minLength={4}
              maxLength={50}
              helperText="Create a new leaderboard to have a place to compare your times with those who join your leaderboard."
            />
            <Button className="mt-4" type="submit" onClick={createLeaderboard} fullSized>
              Create Leaderboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
