import { useEffect, useState } from "react";
import { Category, Grid } from "../Models";
import * as _ from "underscore";

type Props = {
  grid: Grid;
  onCorrect: (category: Category, total: number) => void;
  onIncorrect: (words: string[]) => void;
};

function Row({ children }: React.PropsWithChildren) {
  return <div className="flex flex-row grow text-xs md:text-lg max-h-20 md:max-h-24 gap-2">{children}</div>;
}

export default function InteractiveGrid({ grid, onCorrect, onIncorrect }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [matchedCategories, setMatchedCategories] = useState<Category[]>([]);
  const [remaining, setRemaining] = useState<string[]>(_.shuffle(grid.categories.flatMap((x) => x.answers)));

  useEffect(() => {
    if (selected.length >= 4) {
      const matchedCategory = grid.categories.find((x) => x.answers.every((x) => selected.includes(x)));
      if (matchedCategory) {
        setMatchedCategories((m) => {
          m.push(matchedCategory);
          onCorrect(matchedCategory, m.length);
          return [...m];
        });

        setRemaining((r) => {
          r = _.reject(r, (r) => matchedCategory.answers.includes(r));
          return [...r];
        });

      } else {
        onIncorrect(selected);
      }
      setSelected([]);
    }
  }, [selected, setSelected, grid.categories, setMatchedCategories, setRemaining, onCorrect, onIncorrect]);

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
    <div className="flex flex-col grow text-center gap-2">
      <div>
        <h1 className="text-xl font-bold">{grid.id}</h1>

        <h2 className="text-sm text-gray-400">
          <span className="mr-1">by</span>
          {grid.source === "NYT" ? (
            <a href="https://www.nytimes.com/games/connections" target="_" className="text-sky-400 hover:text-sky-600">
              {grid.createdBy}
            </a>
          ) : (
            <span>{grid.createdBy}</span>
          )}
        </h2>
      </div>
      {matchedCategories.map((category, i) => (
        <Row key={i}>
          {category.answers.map((word, j) => {
            const color = "bg-green-700 text-white";
            return (
              <div key={j} className={`flex-1 grow rounded-lg content-center font-bold ${color}`}>
                {word}
              </div>
            );
          })}
        </Row>
      ))}
      {_.chunk(remaining, 4).map((words, i) => (
        <Row key={i}>
          {words.map((word, j) => {
            const color = selected.includes(word)
              ? "bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800";
            return (
              <button
                key={j}
                className={`flex-1 grow rounded-lg content-center font-semibold ${color}`}
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
