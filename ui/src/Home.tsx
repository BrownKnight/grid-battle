import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col max-w-screen-md mx-auto">
      <h1 className="text-xl font-bold text-center">Grid Battle</h1>

      <Link to="/battle">Create a Battle</Link>
      <Link to="/battle">Join a Battle</Link>
      <Link to="/grid/random">Random Grid</Link>
    </div>
  )
}
