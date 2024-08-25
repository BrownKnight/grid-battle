import { Category, Grid } from "../Models";
import InteractiveGrid from "./InteractiveGrid";
import Timer from "../common/Timer";
import SimpleGrid from "./SimpleGrid";

type Props = {
  grid: Grid;
  startTime: number;
  interactive?: boolean;
  onCorrect: (category: Category) => void;
  onIncorrect: (words: string[]) => void;
  penalties: number;
};

export default function TimedGrid({ grid, startTime, interactive, onCorrect, onIncorrect, penalties }: Props) {
  return (
    <div className="flex flex-col flex-auto px-2 md:px-4 pb-1 pt-4 gap-2 rounded-lg border-2">
      {interactive ? (
        <InteractiveGrid grid={grid} onCorrect={onCorrect} onIncorrect={onIncorrect} />
      ) : (
        <SimpleGrid grid={grid} matchedCount={1} />
      )}

      <Timer className="self-center" timeSince={startTime} penaltyTime={penalties * 10 * 1000} />
      <div></div>
    </div>
  );
}
