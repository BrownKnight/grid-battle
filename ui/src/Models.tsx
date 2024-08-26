export type Grid = {
  id: string;
  name: string;
  source: GridSource;
  createdDateTime: string;
  createdBy: string;
  categories: Category[];
};

export type GridSource = "NYT" | "Custom" | "Test";

export type Category = {
  name: string;
  answers: string[];
};
