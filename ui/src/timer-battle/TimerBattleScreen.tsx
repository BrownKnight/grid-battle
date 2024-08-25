import { useContext } from "react";
import { TimerBattleContext } from "./TimerBattleContext";
import { Button, Table } from "flowbite-react";
import _ from "underscore";
import TimedGrid from "../grid/TimedGrid";
import { Category } from "../Models";

export default function TimerBattleScreen() {
  const { battle, username, signalR } = useContext(TimerBattleContext);

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

  if (battle.state === "InProgress") {
    return (
      <div className="flex flex-col grow max-w-screen-md mx-auto p-2">
        <TimedGrid
          grid={battle.grid!}
          startTime={Date.parse(battle.roundStartedAt!)}
          interactive
          onCorrect={onCorrect}
          onIncorrect={onIncorrect}
          penalties={battle.players.find((x) => x.name === username)?.scores[battle.roundNumber]?.penalties ?? 0}
        />
      </div>
    );
  }

  // Battle is not in progress, need to pick a grid
  return (
    <div className="flex flex-col gap-4 max-w-screen-md p-4 mx-auto">
      <TimerBattleScores />
      <Button onClick={selectRandomGrid}>Start with Random Grid</Button>
    </div>
  );
}

function TimerBattleScores() {
  const { battle, username } = useContext(TimerBattleContext);

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Pos</Table.HeadCell>
        <Table.HeadCell>Player</Table.HeadCell>
        {_.range(battle!.roundNumber).map((round) => (
          <Table.HeadCell key={round}>Round {round}</Table.HeadCell>
        ))}
        <Table.HeadCell>Total</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {battle!.players.map((player, i) => (
          <Table.Row key={i} className={player.name === username ? "bg-orange-100" : ""}>
            <Table.Cell>{i + 1}</Table.Cell>
            <Table.Cell >{player.name}</Table.Cell>
            {player.scores.map((score) => (
              <Table.Cell>{score.time}</Table.Cell>
            ))}
            <Table.Cell>TODO: TOTAL</Table.Cell>
          </Table.Row>
        ))}
      <Table.Row>
        <Table.Cell className="text-center" colSpan={99}>Room Code: <span className="font-mono font-semibold">{battle?.roomId}</span></Table.Cell>
      </Table.Row>
      </Table.Body>
    </Table>
  );
}
