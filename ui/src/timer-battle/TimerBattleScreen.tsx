import { useContext } from "react";
import { TimerBattleContext } from "./TimerBattleContext";
import { Badge, Button, Clipboard, HR, Popover, Table } from "flowbite-react";
import _ from "underscore";
import TimedGrid from "../grid/TimedGrid";
import { Category } from "../Models";
import { useNavigate } from "react-router-dom";
import { TimerBattlePlayer } from "./Models";
import { HiOutlineEllipsisHorizontal } from "react-icons/hi2";
import SearchGrids from "../grid/SearchGrids";
import TimeDisplay from "../common/TimeDisplay";
import InteractiveGrid from "../grid/InteractiveGrid";

export default function TimerBattleScreen() {
  const { battle, username, sendMessage, setBattle, setRoomId } = useContext(TimerBattleContext);
  const navigate = useNavigate();

  if (!battle) return <></>;

  const onCorrect = (_: Category, total: number) => {
    sendMessage("UpdateScore", total, battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0);
  };
  const onIncorrect = () => {
    sendMessage(
      "UpdateScore",
      battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.matchCount ?? 0,
      (battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0) + 1
    );
  };

  const selectRandomGrid = () => {
    fetch("/api/grids/random")
      .then((res) => res.json())
      .then((res) => selectGrid(res.id));
  };

  const selectGrid = (gridId: string) => {
    sendMessage("StartBattle", gridId);
  };

  const leaveGame = () => {
    sendMessage("LeaveBattle")?.then(async () => {
      setBattle(undefined);
      setRoomId("");
      navigate("/battle");
    });
  };

  const endRound = () => {
    sendMessage("EndRound");
  };

  const isHost = battle?.players.find((x) => x.name.toUpperCase() === username.toUpperCase())?.isHost === true;

  if (battle.state === "InProgress") {
    return (
      <div className="flex flex-col grow mb-4">
        <div className="flex grow justify-center p-2">
          <div className="flex flex-col grow max-w-screen-md mx-auto">
            <TimedGrid
              grid={battle.grid!}
              startTime={Date.parse(battle.roundStartedAt!)}
              interactive
              onCorrect={onCorrect}
              onIncorrect={onIncorrect}
              penalties={battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0}
              staticTime={battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.time}
            />
            <HR className="m-1" />
          </div>
        </div>

        <div className="flex overflow-x-auto justify-center">
          <div className="inline-flex gap-2 px-2">
            {battle.players
              .filter((x) => x.name !== username)
              .map((player) => (
                <div key={player.name} className="w-36">
                  <TimedGrid
                    grid={battle.grid!}
                    startTime={Date.parse(battle.roundStartedAt!)}
                    staticTime={player.scores[battle.roundNumber]?.time}
                    penalties={player.scores[battle.roundNumber]?.penalties ?? 0}
                    onCorrect={() => {}}
                    onIncorrect={() => {}}
                    matchedCount={player.scores[battle.roundNumber]?.matchCount ?? 0}
                    title={player.name}
                  />
                </div>
              ))}

            {isHost && (
              <div className="flex flex-col content-center text-center justify-between w-36 border-2 dark:border-slate-700 px-2 pt-1 pb-2 rounded-lg">
                <h3 className="text-sm font-semibold text-black dark:text-gray-200">Host Controls</h3>
                <Button onClick={endRound} size="xs" color="red">
                  End Round
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Battle is not in progress, need to pick a grid
  return (
    <div className="flex flex-col gap-4 m-4">
      <div className="flex grow justify-center my-2 overflow-visible overflow-x-auto">
        <TimerBattleScores />
      </div>
      <div className="flex grow justify-center p-2">
        <div className="flex flex-col gap-2 grow max-w-screen-md">
          <Button onClick={selectRandomGrid}>Start with Random Grid</Button>
          <Button onClick={leaveGame} role="destructive" color="red">
            Leave Game
          </Button>
        </div>
      </div>
      {battle.grid && (
        <div className="flex grow justify-center p-2">
          <div className="flex flex-col gap-2 grow max-w-screen-md">
            <h1 className="font-semibold text-2xl text-center my-2">Previous Grid</h1>
            <InteractiveGrid grid={battle.grid} onCorrect={() => {}} onIncorrect={() => {}} startComplete={true} />
          </div>
        </div>
      )}
      <div className="flex grow justify-center p-2">
        <div className="grow max-w-screen-md">
          <h1 className="font-semibold text-2xl text-center my-2">Search for a Grid</h1>
          <SearchGrids pageSize={5} onGridChosen={(gridId) => selectGrid(gridId)} />
        </div>
      </div>
      <div className="self-center text-lg font-semibold">{isHost && <h1>Host Controls</h1>}</div>
      <div className="flex grow justify-center pb-2">
        <div className="grow max-w-screen-md">{isHost && <HostControls />}</div>
      </div>
    </div>
  );
}

function calculateTotalTime(player: TimerBattlePlayer) {
  return player.scores.map((x) => x.time).reduce((prev, curr) => prev + curr, 0);
}

function calculatePenalties(player: TimerBattlePlayer) {
  return player.scores.map((x) => x.penalties).reduce((prev, curr) => prev + curr, 0);
}

function TimerBattleScores() {
  const { battle } = useContext(TimerBattleContext);

  return (
    <Table className="grow">
      <Table.Head>
        <Table.HeadCell className="p-2">Pos</Table.HeadCell>
        <Table.HeadCell className="p-2">Player</Table.HeadCell>
        {_.range(battle!.roundNumber).map((round) => (
          <Table.HeadCell className="p-2 min-w-20" key={round}>
            Round {round + 1}
          </Table.HeadCell>
        ))}
        <Table.HeadCell className="p-2">Total</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {battle!.players
          .sort((a, b) => calculateTotalTime(a) - calculateTotalTime(b))
          .map((player, i) => {
            const totalTime = calculateTotalTime(player);
            const totalPenalties = calculatePenalties(player);
            return (
              <Table.Row key={i}>
                <Table.Cell className="p-2 text-right">{i + 1}</Table.Cell>
                <Table.Cell className="inline-flex gap-2 p-2 items-center">
                  <span>{player.name}</span>
                  {player.isHost && <Badge>Host</Badge>}
                  {!player.isActive && <Badge color="warning">Disconnected</Badge>}
                </Table.Cell>
                {player.scores.map((score, j) => {
                  return (
                    <Table.Cell key={j} className="font-mono p-2">
                      <TimeDisplay totalTime={score.time} penalties={score.penalties} />
                    </Table.Cell>
                  );
                })}
                <Table.Cell className="font-mono p-2">
                  <TimeDisplay totalTime={totalTime} penalties={totalPenalties} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        <Table.Row>
          <Table.Cell className="text-center" colSpan={99}>
            <div className="relative w-52 mx-auto">
              Room Code: <span className="font-mono font-semibold">{battle!.roomId}</span>
              <Clipboard.WithIcon valueToCopy={battle!.roomId} />
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

function HostControls() {
  const { battle, sendMessage } = useContext(TimerBattleContext);

  const kickPlayer = (playerName: string) => {
    sendMessage("KickPlayer", playerName);
  };

  const markPlayerAsDisconnected = (playerName: string) => {
    sendMessage("MarkPlayerAsDisconnected", playerName);
  };

  return (
    <Table className="grow">
      <Table.Head>
        <Table.HeadCell className="p-2">Player</Table.HeadCell>
        <Table.HeadCell className="p-2">Tags</Table.HeadCell>
        <Table.HeadCell className="p-2"></Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {battle!.players
          .sort((a, b) => calculateTotalTime(a) - calculateTotalTime(b))
          .map((player, i) => {
            return (
              <Table.Row key={i}>
                <Table.Cell className="p-2">
                  <span>{player.name}</span>
                </Table.Cell>
                <Table.Cell className="inline-flex gap-2 p-2 items-center">
                  {player.isHost && <Badge>Host</Badge>}
                  {!player.isActive && <Badge color="warning">Disconnected</Badge>}
                </Table.Cell>
                <Table.Cell className="p-2 text-center">
                  <Popover
                    content={
                      <div className="w-56 flex flex-col p-2">
                        <Button size="xs" color="yellow" onClick={() => markPlayerAsDisconnected(player.name)}>
                          Mark as Disconnected
                        </Button>
                        <span className="mt-1 text-xs text-gray-400">If a player is unable to rejoin, mark them as disconnected</span>
                        <Button className="mt-2" size="xs" color="failure" onClick={() => kickPlayer(player.name)}>
                          Kick Player
                        </Button>
                      </div>
                    }
                  >
                    <div className="flex justify-end">
                      <HiOutlineEllipsisHorizontal size="20" />
                    </div>
                  </Popover>
                </Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    </Table>
  );
}
