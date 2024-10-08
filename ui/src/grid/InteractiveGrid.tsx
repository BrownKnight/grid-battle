import { useEffect, useState } from "react";
import { Category, Grid } from "../Models";
import * as _ from "underscore";
import GridTitle from "./GridTitle";

type Props = {
  grid: Grid;
  onCorrect: (category: Category, total: number) => void;
  onIncorrect: (words: string[]) => void;
  startComplete?: boolean;
};

function Row({ children }: React.PropsWithChildren) {
  return <div className="flex flex-row aspect-[5/1] md:aspect-[6/1] gap-1 md:gap-2">{children}</div>;
}

export default function InteractiveGrid({ grid, onCorrect, onIncorrect, startComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [matchedCategories, setMatchedCategories] = useState<Category[]>(startComplete ? grid.categories : []);
  const [remaining, setRemaining] = useState<string[]>(_.shuffle(startComplete ? [] : grid.categories.flatMap((x) => x.answers)));

  useEffect(() => {
    if (selected.length >= 4) {
      const matchedCategory = grid.categories.find((x) => x.answers.every((x) => selected.includes(x)));
      if (matchedCategory) {
        onCorrect(matchedCategory, matchedCategories.length + 1);
        setMatchedCategories((m) => [...m, matchedCategory]);

        setRemaining((r) => {
          r = _.reject(r, (r) => matchedCategory.answers.includes(r));
          return [...r];
        });
      } else {
        onIncorrect(selected);
      }
      setSelected([]);
    }
  }, [selected, setSelected, grid.categories, setMatchedCategories, setRemaining, onCorrect, onIncorrect, matchedCategories.length]);

  const toggleSelected = (answer: string) => {
    setSelected((x) => {
      if (!x.includes(answer)) {
        x.push(answer);
      } else {
        x = _.reject(x, (y) => y === answer);
      }
      return [...x];
    });
  };

  return (
    <div className="flex flex-col grow text-center gap-1 md:gap-2">
      <div className="flex flex-row">
        <GridTitle grid={grid} />
      </div>

      {matchedCategories.map((category, i) => (
        <Row key={i}>
          <div className="flex-1 grow rounded-lg content-center bg-green-700 text-white">
            <p className="font-bold text-normal md:text-lg">{category.name}</p>
            <p className="font-normal text-xs md:text-sm">{category.answers.join(" | ")}</p>
          </div>
        </Row>
      ))}
      {_.chunk(remaining, 4).map((words, i) => (
        <Row key={i}>
          {words.map((word, j) => {
            const color = selected.includes(word) ? "bg-teal-500 active:bg-teal-300" : "bg-gray-200 active:bg-teal-400";
            return (
              <button
                key={j}
                className={`flex-1 grow rounded-lg content-center font-semibold text-gray-800 ${
                  word.length > 7 ? "text-[0.6rem]" : "text-sm"
                } md:text-lg ${color}`}
                onClick={() => toggleSelected(word)}
              >
                {word}
              </button>
            );
          })}
        </Row>
      ))}
    </div>
  );
}
