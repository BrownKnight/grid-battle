import { Badge, Spinner, Table } from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { LeaderboardEntry } from "../Models";
import useApiClient from "../useApiClient";
import TimeDisplay from "../common/TimeDisplay";
import { UserContext } from "../UserContext";
import Paginator from "../common/Paginator";

export default function LeaderboardEntriesTable({ gridId, leaderboardId }: { gridId: string; leaderboardId: string }) {
  const PAGE_SIZE = 20;

  const apiClient = useApiClient();
  const { user } = useContext(UserContext);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gridId && leaderboardId) {
      setLoading(true);

      apiClient.getLeaderboardEntriesForGrid(gridId, leaderboardId, offset, PAGE_SIZE).then(({ json }) => {
        if (json) setEntries(json);

        setLoading(false);
      });
    }
  }, [apiClient, leaderboardId, gridId, offset]);

  if (loading)
    return (
      <div className="mx-auto">
        <Spinner />
      </div>
    );

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell className="p-1"></Table.HeadCell>
        <Table.HeadCell className="p-2">Username</Table.HeadCell>
        <Table.HeadCell className="p-2">Entry Date</Table.HeadCell>
        <Table.HeadCell className="p-2">Time</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {entries.map((entry, i) => (
          <Table.Row key={entry.userId}>
            <Table.Cell className="p-1">{i + offset + 1}</Table.Cell>
            <Table.Cell className="p-2">
              <span className="inline-flex gap-2">
                {entry.username}
                {user?.username === entry.username && <Badge>You</Badge>}
              </span>
            </Table.Cell>
            <Table.Cell className="p-2">
              {new Date(Date.parse(entry.createdDateTime)).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
            </Table.Cell>
            <Table.Cell className="p-2">
              <TimeDisplay totalTime={entry.totalTime} penalties={entry.penalties} />
            </Table.Cell>
          </Table.Row>
        ))}

        <Table.Row className="bg-gray-50 dark:bg-gray-700">
          <Table.Cell className="p-0" colSpan={99}>
            <Paginator offset={offset} setOffset={setOffset} pageSize={PAGE_SIZE} resultsLength={entries.length} loading={loading} />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
