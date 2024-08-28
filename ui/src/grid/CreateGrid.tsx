import { Button, FloatingLabel, HR, Label, TextInput } from "flowbite-react";
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
          <FloatingLabel variant="outlined" label="Grid Name" value={gridName} onChange={(e) => setGridName(e.target.value)} required />
          <FloatingLabel variant="outlined" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      </div>

      {categories.map((category, i) => (
        <div className="flex flex-col m-2 rounded-lg">
          <HR.Text text={`Category ${i + 1}`} />
          <div className="w-64 mx-auto">
            <FloatingLabel
              variant="outlined"
              label="Category Name"
              value={category.name}
              onChange={(e) => setCategoryName(e, i)}
              required
            />
          </div>
          <span className="text-center mt-4">Answers</span>
          <div key={i} className="flex flex-row flex-wrap px-2 pb-2">
            {category.answers.map((answer, j) => (
              <div key={j} className="p-1 grow">
                <FloatingLabel variant="outlined" value={answer} onChange={(e) => setAnswers(e, i, j)} required label={`Answer ${j + 1}`} />
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
