import { Grid } from "../Models";
import * as _ from "underscore";

export default function SimpleGrid({ grid, matchedCount, title }: { grid: Grid; matchedCount: number; title?: string }) {
  const rowCount = grid.categories.length;
  const columnCount = grid.categories[0].answers.length;

  return (
    <div className="flex flex-col gap-1">
      {title && <h1 className="self-center font-semibold text-sm">{title}</h1>}
      {_.range(0, matchedCount).map((i) => {
        return (
          <div key={i} className="flex flex-row gap-2 aspect-[6/1]">
            {_.range(columnCount).map((j) => (
              <div key={j} className="bg-green-700 grow rounded"></div>
            ))}
          </div>
        );
      })}
      {_.range(matchedCount, rowCount).map((i) => {
        return (
          <div key={i} className="flex flex-row gap-1 aspect-[6/1]">
            {_.range(columnCount).map((j) => (
              <div key={j} className="bg-gray-100 grow rounded"></div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
