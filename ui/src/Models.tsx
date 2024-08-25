export type Grid = {
  id: string;
  source: GridSource;
  createdDateTime: string;
  createdBy: string;
  categories: Category[];
};

export type GridSource = "NYT" | "Custom";

export type Category = {
  name: string;
  answers: string[];
};
