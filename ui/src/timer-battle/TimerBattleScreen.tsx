import { useContext } from "react";
import { TimerBattleContext } from "./TimerBattleContext";
import { Button, Table } from "flowbite-react";
import _ from "underscore";
import TimedGrid from "../grid/TimedGrid";
import { Category } from "../Models";
import { useNavigate } from "react-router-dom";
import { TimerBattlePlayer } from "./Models";

export default function TimerBattleScreen() {
  const { battle, username, signalR, setBattle, setRoomId } = useContext(TimerBattleContext);
  const navigate = useNavigate();

  if (!battle) return <></>;

  const onCorrect = (_: Category, total: number) => {
    signalR.invoke("UpdateScore", total, battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0);
  };
  const onIncorrect = () => {
    signalR.invoke(
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
    signalR.invoke("StartBattle", gridId);
  };

  const leaveGame = () => {
    navigate("/battle");
    setRoomId("");
    setBattle(undefined);
  };

  if (battle.state === "InProgress") {
    return (
      <div className="flex flex-col grow content-center mb-4 overflow-y-auto">
        <div className="flex grow">
          <div className="flex flex-auto max-w-screen-md mx-auto p-2">
            <TimedGrid
              grid={battle.grid!}
              startTime={Date.parse(battle.roundStartedAt!)}
              interactive
              onCorrect={onCorrect}
              onIncorrect={onIncorrect}
              penalties={battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0}
            />
          </div>
        </div>
        <div className="flex flex-row w-36 overflow-x-auto mx-auto">
          {battle.players
            .filter((x) => x.name !== username)
            .map((player) => (
              <TimedGrid
                grid={battle.grid!}
                startTime={Date.parse(battle.roundStartedAt!)}
                penalties={player.scores[battle.roundNumber]?.penalties ?? 0}
                onCorrect={() => {}}
                onIncorrect={() => {}}
                matchedCount={player.scores[battle.roundNumber]?.matchCount ?? 0}
                title={player.name}
              />
            ))}
        </div>
      </div>
    );
  }

  // Battle is not in progress, need to pick a grid
  return (
    <div className="flex flex-col gap-4 max-w-screen-md p-4 mx-auto">
      <TimerBattleScores />
      <Button onClick={selectRandomGrid}>Start with Random Grid</Button>
      <Button onClick={leaveGame} role="destructive" color="red">Leave Game</Button>
    </div>
  );
}

function calculateTotalTime(player: TimerBattlePlayer) {
  return player.scores.map((x) => x.time).reduce((prev, curr) => prev + curr, 0);
}

function TimerBattleScores() {
  const { battle, username } = useContext(TimerBattleContext);

  return (
    <Table className="overflow-x-auto">
      <Table.Head>
        <Table.HeadCell>Pos</Table.HeadCell>
        <Table.HeadCell>Player</Table.HeadCell>
        {_.range(battle!.roundNumber).map((round) => (
          <Table.HeadCell key={round}>Round {round}</Table.HeadCell>
        ))}
        <Table.HeadCell>Total</Table.HeadCell>
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
                {player.scores.map((score) => {
                  const time = new Date(score.time);
                  return (
                    <Table.Cell className="font-mono">
                      {time.getUTCMinutes()}:{time.getUTCSeconds().toString(10).padStart(2, "0")}
                    </Table.Cell>
                  );
                })}
                <Table.Cell className="font-mono">
                  {totalTime.getUTCMinutes()}:{totalTime.getUTCSeconds().toString(10).padStart(2, "0")}
                </Table.Cell>
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
