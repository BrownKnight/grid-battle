import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, createRoutesFromElements, redirect, Route, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import LocalPlayGrid from "./pages/LocalPlayGrid";
import CreateJoinTimerBattle from "./pages/CreateJoinTimerBattle";
import CreateGrid from "./pages/CreateGrid";
import GridLeaderboard from "./pages/GridLeaderboard";

const randomGridLoader = async () => {
  const res = await fetch("/api/grids/random");
  if (!res.ok) {
    console.error("Failed to fetch a random grid ID", res);
    redirect("/");
  }
  const json = await res.json();
  return json.id ? redirect(`/grids/${json.id}`) : redirect("/");
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="" element={<Home />} />
      <Route path="/:battleCode" element={<CreateJoinTimerBattle />} />
      <Route path="/battle" element={<CreateJoinTimerBattle />} />
      <Route path="/grids/create" element={<CreateGrid />} />
      <Route path="/grids/random" loader={randomGridLoader} />
      <Route path="/grids/:gridId" element={<LocalPlayGrid />} />
      <Route path="/grids/:gridId/leaderboard" element={<GridLeaderboard />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
