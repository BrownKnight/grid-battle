import { Grid } from "../Models";
import * as _ from "underscore";

export default function SimpleGrid({ grid, matchedCount, title }: { grid: Grid; matchedCount: number; title?: string }) {
  const rowCount = grid.categories.length;
  const columnCount = grid.categories[0].answers.length;

  return (
    <div className="flex flex-col gap-1">
      {title && <h1 className="self-center font-semibold text-sm text-black dark:text-gray-200">{title}</h1>}
      {_.range(0, matchedCount).map((i) => {
        return (
          <div key={i} className="flex flex-row aspect-[5/1] md:aspect-[6/1] bg-green-700 rounded">

          </div>
        );
      })}
      {_.range(matchedCount, rowCount).map((i) => {
        return (
          <div key={i} className="flex flex-row gap-1 aspect-[5/1] md:aspect-[6/1]">
            {_.range(columnCount).map((j) => (
              <div key={j} className="bg-gray-200 grow rounded"></div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
