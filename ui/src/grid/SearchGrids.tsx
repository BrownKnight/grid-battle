import { useState } from "react";
import ListGrids from "./ListGrids";
import { GridSource } from "../Models";
import { FloatingLabel, Select } from "flowbite-react";

type Props = {
  pageSize: number;
  onGridChosen: (gridId: string) => void;
};

export default function SearchGrids({ pageSize, onGridChosen }: Props) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<GridSource>("AI");

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <div className="grow">
          <FloatingLabel sizing="sm" variant="outlined" label="Search by Name or ID" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={source} onChange={(e) => setSource(e.target.value as GridSource)}>
          <option value="NYT">NYT</option>
          <option value="AI">AI Generated</option>
          <option value="Custom">User Submitted</option>
        </Select>
      </form>
      <ListGrids onGridChosen={onGridChosen} pageSize={pageSize} query={query} source={source} />
    </div>
  );
}
