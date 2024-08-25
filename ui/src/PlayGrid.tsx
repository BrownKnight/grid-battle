import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "./Models";
import { Spinner } from "flowbite-react";
import InteractiveGrid from "./grid/InteractiveGrid";
import TimedGrid from "./grid/TimedGrid";

export default function PlayGrid() {
  const { gridId } = useParams();
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<Grid | undefined>(undefined);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/grids/${gridId}`)
      .then((res) => {
        if (res.status !== 200) {
          console.log("Grid not found");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (res) setGrid(res);
        setLoading(false);
        setStartTime(Date.now());
      });
  }, [gridId]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Spinner />
        <span>Loading Grid...</span>
      </div>
    );
  }

  if (!grid) {
    return <div>unknown error, no grid loaded</div>
  }

  return (
    <div className="flex flex-col max-w-screen-md mx-auto min-h-svh">
      <TimedGrid grid={grid} startTime={startTime} interactive />
    </div>
  );
}
