import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Root from "./Root";
import Home from "./Home";
import LocalPlayGrid from "./LocalPlayGrid";
import CreateJoinTimerBattle from "./timer-battle/CreateJoinTimerBattle";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="" element={<Home />} />
      <Route path="/:battleCode" element={<CreateJoinTimerBattle />} />
      <Route path="/battle" element={<CreateJoinTimerBattle />} />
      <Route path="/grid/:gridId" element={<LocalPlayGrid />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
