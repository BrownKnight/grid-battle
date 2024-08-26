import { Button, Label, TextInput } from "flowbite-react";
import { useContext, useState } from "react";
import { Category } from "../Models";
import { ErrorContext } from "../ErrorContext";
import { useNavigate } from "react-router-dom";

export default function CreateGrid() {
  const { addError } = useContext(ErrorContext);
  const navigate = useNavigate();
  const [gridName, setGridName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([
    { name: "", answers: ["", "", "", ""] },
    { name: "", answers: ["", "", "", ""] },
    { name: "", answers: ["", "", "", ""] },
    { name: "", answers: ["", "", "", ""] },
  ]);

  const setCategoryName = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setCategories((x) => {
      x = [...x];
      x[index].name = e.target.value.toUpperCase();
      return x;
    });
  };

  const setAnswers = (e: React.ChangeEvent<HTMLInputElement>, categoryIndex: number, answerIndex: number) => {
    setCategories((x) => {
      x = [...x];
      x[categoryIndex].answers[answerIndex] = e.target.value.toUpperCase();
      return x;
    });
  };

  const createGame = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/grids", { method: "POST", body: JSON.stringify({ name: gridName, createdBy: username, categories: categories }) })
      .then((res) => {
        if (res.status >= 400) {
          addError("Error occured when creating the game");
          return null;
        }
        return res.json();
      })
      .then((res) => {
        navigate(`/grid/${res.id}`);
      });
  };

  return (
    <form className="flex flex-col grow text-base" onSubmit={createGame}>
      <span className="my-4 font-bold text-xl text-center">Create your own Grid</span>
      <div className="flex justify-center p-2">
        <div className="flex flex-col grow max-w-screen-sm">
          <Label htmlFor="gridName" value="Grid Name" />
          <TextInput value={gridName} onChange={(e) => setGridName(e.target.value)} required />

          <Label className="mt-4" htmlFor="username" value="Username" />
          <TextInput value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      </div>

      {categories.map((category, i) => (
        <div className="flex flex-col border-2 m-2 rounded-lg">
          <span className="text-center mt-2 mb-1 font-semibold">Category {i + 1}</span>
          <TextInput className="w-64 mx-auto" value={category.name} onChange={(e) => setCategoryName(e, i)} required />
          <span className="text-center mt-4">Answers</span>
          <div key={i} className="flex flex-row flex-wrap px-2 pb-2">
            {category.answers.map((answer, j) => (
              <div key={j} className="p-1 grow">
                <TextInput value={answer} onChange={(e) => setAnswers(e, i, j)} required />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button type="submit" color="success" className="self-center w-64 m-4 mb-8">
        Create Game
      </Button>
    </form>
  );
}
