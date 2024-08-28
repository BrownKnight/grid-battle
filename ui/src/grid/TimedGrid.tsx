import { Category, Grid } from "../Models";
import InteractiveGrid from "./InteractiveGrid";
import Timer from "../common/Timer";
import SimpleGrid from "./SimpleGrid";

type Props = {
  grid: Grid;
  startTime: number;
  staticTime?: number;
  interactive?: boolean;
  onCorrect: (category: Category, total: number) => void;
  onIncorrect: (words: string[]) => void;
  penalties: number;
  matchedCount?: number;
  title?: string;
};

export default function TimedGrid({
  grid,
  startTime,
  staticTime,
  interactive,
  onCorrect,
  onIncorrect,
  penalties,
  title,
  matchedCount,
}: Props) {
  return (
    <div className={`flex flex-col flex-auto px-2 md:px-4 pb-1 gap-2 rounded-lg border-2 dark:border-slate-700 ${interactive ? "pt-1 md:pt-3" : "pt-1"}`}>
      {interactive ? (
        <InteractiveGrid grid={grid} onCorrect={onCorrect} onIncorrect={onIncorrect} />
      ) : (
        <SimpleGrid grid={grid} matchedCount={matchedCount ?? 0} title={title} />
      )}

      <Timer
        className={`self-center ${interactive ? "" : "text-xs"}`}
        timeSince={startTime}
        staticTime={staticTime}
        penaltyTime={penalties * 10 * 1000}
      />
    </div>
  );
}
