import { Grid } from "../Models";

export default function GridTitle({ grid }: { grid: Grid }) {
  return (
    <div className="flex flex-row justify-between mb-1 grow">
      <div className="flex flex-col items-start">
        <span className="text-lg font-semibold">{grid.name}</span>

        <span className="text-xs text-gray-400 mr-1">
          by
          {grid.source === "NYT" ? (
            <a href="https://www.nytimes.com/games/connections" target="_" className="ml-1 text-sky-400 hover:text-sky-600">
              {grid.createdBy}
            </a>
          ) : (
            <span className="ml-1 text-gray-400">{grid.createdBy}</span>
          )}
        </span>
      </div>

      <div className="flex flex-col items-end justify-around">
        <span className="text-xs text-gray-400">{new Date(grid.createdDateTime).toLocaleDateString()}</span>
        <span className="text-xs text-gray-400">ID: <span className="font-mono font-semibold">{grid.id}</span></span>
      </div>
    </div>
  );
}
