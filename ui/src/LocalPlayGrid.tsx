import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Category, Grid } from "./Models";
import { Button, Spinner } from "flowbite-react";
import TimedGrid from "./grid/TimedGrid";
import { ErrorContext } from "./ErrorContext";
import SimpleGrid from "./grid/SimpleGrid";
import GridTitle from "./grid/GridTitle";

export default function LocalPlayGrid() {
  const { gridId } = useParams();
  const { addError } = useContext(ErrorContext);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<Grid | undefined>(undefined);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [staticTime, setStaticTime] = useState<number | undefined>(undefined);
  const [penalties, setPenalties] = useState<number>(0);
  const [playing, setPlaying] = useState(false);

  const onCorrect = (_: Category, total: number) => {
    if (total === grid?.categories.length) {
      setStaticTime(Date.now() - startTime + penalties * 10000);
    }
  };
  const onIncorrect = () => setPenalties((p) => ++p);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/grids/${gridId}`)
      .then((res) => {
        if (res.status !== 200) {
          addError("Grid not found");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (res) setGrid(res);
        setLoading(false);
        setStartTime(Date.now());
        setStaticTime(undefined);
        setPenalties(0);
        setPlaying(false);
      });
  }, [gridId, addError]);

  const startGame = () => {
    setPlaying(true);
    setStartTime(Date.now());
    setStaticTime(undefined);
    setPenalties(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-8 text-lg gap-4">
        <Spinner size="lg" />
        <span>Loading Grid...</span>
      </div>
    );
  }

  if (!grid) {
    return <div>unknown error, no grid loaded</div>;
  }

  if (!playing) {
    return (
      <div className="flex flex-col grow">
        <div className="flex grow justify-center p-4">
          <div className="flex flex-col grow max-w-screen-md mx-auto">
            <GridTitle grid={grid} />

            <div className="mt-4 grow">
              <SimpleGrid grid={grid} matchedCount={0} />
            </div>

            <Button onClick={startGame}>Play Grid</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow mb-4">
      <div className="flex grow justify-center p-2">
        <div className="flex flex-col grow max-w-screen-md mx-auto">
          <TimedGrid
            grid={grid}
            startTime={startTime}
            staticTime={staticTime}
            interactive
            onCorrect={onCorrect}
            onIncorrect={onIncorrect}
            penalties={penalties}
          />
        </div>
      </div>
    </div>
  );
}
