import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Home from "./pages/Home";
import LocalPlayGrid from "./pages/LocalPlayGrid";
import CreateJoinTimerBattle from "./pages/CreateJoinTimerBattle";
import CreateGrid from "./pages/CreateGrid";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="" element={<Home />} />
      <Route path="/:battleCode" element={<CreateJoinTimerBattle />} />
      <Route path="/battle" element={<CreateJoinTimerBattle />} />
      <Route path="/grids/create" element={<CreateGrid />} />
      <Route path="/grids/:gridId" element={<LocalPlayGrid />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
