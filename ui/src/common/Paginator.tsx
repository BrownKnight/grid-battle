import { Button, Spinner } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { BiCaretLeft, BiCaretRight } from "react-icons/bi";

type Props = {
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
  pageSize: number;
  resultsLength: number;
  loading?: boolean;
};

export default function Paginator({ offset, setOffset, pageSize, resultsLength, loading }: Props) {
  return (
    <div className="flex flex-row justify-between items-center p-4">
      {offset > 0 ? (
        <Button className="w-10" outline pill size="sm" onClick={() => setOffset((x) => x - pageSize)}>
          <BiCaretLeft />
        </Button>
      ) : (
        <div className="w-10">&nbsp;</div>
      )}

      {loading ? <Spinner size="lg" /> : <span>Page {offset / pageSize + 1}</span>}

      {resultsLength === pageSize ? (
        <Button className="w-10" outline pill size="sm" onClick={() => setOffset((x) => x + pageSize)}>
          <BiCaretRight />
        </Button>
      ) : (
        <div className="w-10">&nbsp;</div>
      )}
    </div>
  );
}
