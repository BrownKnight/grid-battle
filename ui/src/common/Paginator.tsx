import { Spinner } from "flowbite-react";
import { Dispatch, SetStateAction } from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";

type Props = {
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
  pageSize: number;
  resultsLength: number;
  loading?: boolean;
};

export default function Paginator({ offset, setOffset, pageSize, resultsLength, loading }: Props) {
  return (
    <div className="flex flex-row justify-between items-center py-2 px-4">
      {offset > 0 ? (
        <button>
          <RxCaretLeft
            fontSize={40}
            className="w-12 cursor-pointer text-sky-400 hover:text-sky-600"
            onClick={() => setOffset((x) => x - pageSize)}
          />
        </button>
      ) : (
        <div className="w-12">&nbsp;</div>
      )}

      {loading ? <Spinner size="lg" /> : <span>Page {offset / pageSize + 1}</span>}

      {resultsLength === pageSize ? (
        <button>
          <RxCaretRight
            fontSize={40}
            className="w-12 cursor-pointer text-sky-400 hover:text-sky-600"
            onClick={() => setOffset((x) => x + pageSize)}
          />
        </button>
      ) : (
        <div className="w-12">&nbsp;</div>
      )}
    </div>
  );
}
