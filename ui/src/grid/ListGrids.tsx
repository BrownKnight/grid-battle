import { useContext, useEffect, useState } from "react";
import { Grid, GridSource } from "../Models";
import { ErrorContext } from "../ErrorContext";
import { Button, ListGroup, Spinner } from "flowbite-react";
import { BiCaretLeft, BiCaretRight } from "react-icons/bi";

type Props = {
  pageSize: number;
  source?: GridSource;
  query?: string;
  onGridChosen: (gridId: string) => void;
};

export default function ListGrids({ pageSize, source, query, onGridChosen }: Props) {
  const { addError } = useContext(ErrorContext);
  const [offset, setOffset] = useState<number>(0);
  const [results, setResults] = useState<Grid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const queryStr = [`offset=${offset}`, `limit=${pageSize}`];
    if (source) queryStr.push(`source=${source}`);
    if (query) queryStr.push(`search=${query}`);

    fetch(`/api/grids?${queryStr.join("&")}`)
      .then((res) => {
        setLoading(false);
        if (res.status > 200) {
          setResults([]);
          throw Error("Unexpected error when fetching grids");
        }
        return res.json();
      })
      .then((res) => setResults(res))
      .catch((err) => addError(err));
  }, [pageSize, source, query, offset, setResults, addError]);

  return (
    <ListGroup>
      {!loading && results.length === 0 && <ListGroup.Item>No Grids Found</ListGroup.Item>}
      {results.map((grid, i) => {
        return (
          <ListGroup.Item key={i} onClick={() => onGridChosen(grid.id)}>
            <div className="flex flex-row justify-between grow">
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold">{grid.name}</span>
                <span className="text-xs text-gray-400">by {grid.createdBy}</span>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-xs text-gray-400">{new Date(grid.createdDateTime).toLocaleDateString()}</span>
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
      <div className="flex flex-row justify-between items-center p-4">
        {offset > 0 ? (
          <Button className="w-10" outline pill size="sm" onClick={() => setOffset((x) => x - pageSize)}>
            <BiCaretLeft />
          </Button>
        ) : (
          <div className="w-10">&nbsp;</div>
        )}

        {loading ? <Spinner size="lg" /> : <span>Page {offset / pageSize + 1}</span>}

        {results.length === pageSize ? (
          <Button className="w-10" outline pill size="sm" onClick={() => setOffset((x) => x + pageSize)}>
            <BiCaretRight />
          </Button>
        ) : (
          <div className="w-10">&nbsp;</div>
        )}
      </div>
    </ListGroup>
  );
}
