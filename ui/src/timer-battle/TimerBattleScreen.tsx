import { useContext } from "react";
import { TimerBattleContext } from "./TimerBattleContext";
import { Button, Popover, Table } from "flowbite-react";
import _ from "underscore";
import TimedGrid from "../grid/TimedGrid";
import { Category } from "../Models";
import { useNavigate } from "react-router-dom";
import { TimerBattlePlayer } from "./Models";
import { HiOutlineEllipsisHorizontal } from "react-icons/hi2";

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
          </div>
        </div>

        <div className="flex overflow-x-auto justify-center">
          <div className="inline-flex gap-2 px-2">
            {battle.players
              .filter((x) => x.name !== username)
              .map((player) => (
                <div className="w-36">
                  <TimedGrid
                    key={player.name}
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

            <div className="flex flex-col content-center text-center justify-between w-36 border-2 px-2 pt-1 pb-2 rounded-lg">
              <h3 className="text-sm font-semibold">Host Controls</h3>
              <Button onClick={endRound} size="xs" color="red">
                End Round
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Battle is not in progress, need to pick a grid
  return (
    <div className="flex flex-col gap-4 max-w-screen-md p-4 mx-auto">
      <TimerBattleScores />
      <Button onClick={selectRandomGrid}>Start with Random Grid</Button>
      <Button onClick={leaveGame} role="destructive" color="red">
        Leave Game
      </Button>
    </div>
  );
}

function calculateTotalTime(player: TimerBattlePlayer) {
  return player.scores.map((x) => x.time).reduce((prev, curr) => prev + curr, 0);
}

function TimerBattleScores() {
  const { battle, username, sendMessage } = useContext(TimerBattleContext);

  const isHost = battle?.players.find((x) => x.name.toUpperCase() === username.toUpperCase())?.isHost === true;

  const kickPlayer = (playerName: string) => {
    sendMessage("KickPlayer", playerName);
  };

  const markPlayerAsDisconnected = (playerName: string) => {
    sendMessage("MarkPlayerAsDisconnected", playerName);
  };

  return (
    <Table className="overflow-x-auto" hoverable>
      <Table.Head>
        <Table.HeadCell>Pos</Table.HeadCell>
        <Table.HeadCell>Player</Table.HeadCell>
        {_.range(battle!.roundNumber).map((round) => (
          <Table.HeadCell key={round}>Round {round}</Table.HeadCell>
        ))}
        <Table.HeadCell>Total</Table.HeadCell>
        {isHost && <Table.HeadCell></Table.HeadCell>}
      </Table.Head>
      <Table.Body>
        {battle!.players
          .sort((a, b) => calculateTotalTime(a) - calculateTotalTime(b))
          .map((player, i) => {
            const totalTime = new Date(calculateTotalTime(player));
            return (
              <Table.Row key={i} className={player.name === username ? "bg-orange-100" : ""}>
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell>{player.name}</Table.Cell>
                {player.scores.map((score, j) => {
                  const time = new Date(score.time);
                  return (
                    <Table.Cell key={j} className="font-mono">
                      {time.getUTCMinutes()}:{time.getUTCSeconds().toString(10).padStart(2, "0")}
                    </Table.Cell>
                  );
                })}
                <Table.Cell className="font-mono">
                  {totalTime.getUTCMinutes()}:{totalTime.getUTCSeconds().toString(10).padStart(2, "0")}
                </Table.Cell>
                {isHost && (
                  <Table.Cell>
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
                      <div className="text-center">
                        <HiOutlineEllipsisHorizontal className="text-center" size="20" />
                      </div>
                    </Popover>
                  </Table.Cell>
                )}
              </Table.Row>
            );
          })}
        <Table.Row>
          <Table.Cell className="text-center" colSpan={99}>
            Room Code: <span className="font-mono font-semibold">{battle?.roomId}</span>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
