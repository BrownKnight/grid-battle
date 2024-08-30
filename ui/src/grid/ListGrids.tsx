import { useContext, useEffect, useState } from "react";
import { Grid, GridSource } from "../Models";
import { ErrorContext } from "../ErrorContext";
import { ListGroup } from "flowbite-react";
import Paginator from "../common/Paginator";
import GridTitle from "./GridTitle";

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
            <GridTitle grid={grid} />
          </ListGroup.Item>
        );
      })}
      <Paginator offset={offset} setOffset={setOffset} pageSize={pageSize} resultsLength={results.length} loading={loading} />
    </ListGroup>
  );
}
