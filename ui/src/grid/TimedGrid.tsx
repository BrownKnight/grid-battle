import { useEffect, useState } from "react";
import { Grid } from "../Models";
import InteractiveGrid from "./InteractiveGrid";
import Timer from "../common/Timer";

type Props = {
  grid: Grid;
  startTime: number;
  interactive?: boolean;
};

export default function TimedGrid({ grid, startTime, interactive }: Props) {
  const [penalties, setPenalties] = useState<number>(0);

  const onCorrect = () => {};
  const onIncorrect = () => setPenalties((p) => ++p);

  return (
    <div className="flex flex-col flex-auto p-4 rounded-lg border-2">
      {interactive ? (
        <InteractiveGrid grid={grid} onCorrect={onCorrect} onIncorrect={onIncorrect} />
      ) : (
        <div>NON INTERACTIVE NOT SUPPORTED YET</div>
      )}

      <Timer className="self-center" timeSince={startTime} penaltyTime={penalties * 10 * 1000} />
    </div>
  );
}
