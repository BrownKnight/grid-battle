import { Grid } from "../Models";
import * as _ from "underscore";

export default function SimpleGrid({ grid, matchedCount }: { grid: Grid; matchedCount: number }) {
  const rowCount = grid.categories.length;
  const columnCount = grid.categories[0].answers.length;

  return (
    <div className="flex flex-col gap-1">
      {_.range(0, matchedCount).map((i) => {
        return (
          <div key={i} className="flex flex-row gap-2 aspect-[6/1]">
            {_.range(columnCount).map((j) => (
              <div key={j} className="bg-green-700 grow rounded-lg"></div>
            ))}
          </div>
        );
      })}
      {_.range(matchedCount, rowCount).map((i) => {
        return (
          <div key={i} className="flex flex-row gap-1 aspect-[6/1]">
            {_.range(columnCount).map((j) => (
              <div key={j} className="bg-gray-100 grow rounded-lg"></div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
