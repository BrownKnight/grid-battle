import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "./Models";
import { Spinner } from "flowbite-react";
import TimedGrid from "./grid/TimedGrid";

export default function LocalPlayGrid() {
  const { gridId } = useParams();
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<Grid | undefined>(undefined);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [penalties, setPenalties] = useState<number>(0);

  const onCorrect = () => {};
  const onIncorrect = () => setPenalties((p) => ++p);

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
        setPenalties(0);
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
    return <div>unknown error, no grid loaded</div>;
  }

  return (
    <div className="flex flex-col grow max-w-screen-md mx-auto p-2">
      <TimedGrid grid={grid} startTime={startTime} interactive onCorrect={onCorrect} onIncorrect={onIncorrect} penalties={penalties} />
    </div>
  );
}
