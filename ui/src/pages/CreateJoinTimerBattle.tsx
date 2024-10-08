import { TimerBattleContext, TimerBattleContextProvider } from "../timer-battle/TimerBattleContext";
import { Button, ButtonGroup, Label, TextInput } from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import TimerBattleScreen from "../timer-battle/TimerBattleScreen";
import { useMatch, useNavigate } from "react-router-dom";
import { TimerBattleRoom } from "../timer-battle/Models";
import { ErrorContext } from "../ErrorContext";

export default function CreateJoinTimerBattle() {
  function Inner() {
    const { username, battle, setBattle, signalR, setRoomId } = useContext(TimerBattleContext);
    const { addError } = useContext(ErrorContext);
    const match = useMatch("/:battleId");
    const navigate = useNavigate();

    useEffect(() => {
      if (match?.params.battleId && match?.params.battleId.length === 4) {
        setRoomId(match?.params.battleId);
      }
    }, [match?.params.battleId, setRoomId]);

    signalR.useSignalREffect(
      "battle-update",
      (b: TimerBattleRoom) => {
        if (!b.players.find((x) => x.name.toUpperCase() === username.toUpperCase())) {
          // Current player no longer in the game, they've been kicked
          setBattle(undefined);
          setRoomId("");
          navigate("/battle");
          addError("It appears you've been kicked from the game.");
        } else {
          setBattle(b);
        }
      },
      [username, setBattle]
    );

    return battle ? <TimerBattleScreen /> : <JoinTimerBattle />;
  }

  return (
    <TimerBattleContextProvider>
      <Inner />
    </TimerBattleContextProvider>
  );
}

function JoinTimerBattle() {
  const { username, setUsername, roomId, setRoomId, setBattle, sendMessage } = useContext(TimerBattleContext);
  const [type, setType] = useState<"join" | "create">("join");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "join") {
      sendMessage("JoinBattle", roomId, username)?.then((res) => {
        console.log("Joining battle", res);
        setBattle(res);
      });
    } else {
      sendMessage("CreateBattle", username)?.then((res) => {
        console.log("Joining newly created battle", res);
        setBattle(res);
        setRoomId(res.roomId);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-screen-sm mx-auto mt-4 grow">
      <ButtonGroup>
        <Button color={type === "join" ? "dark" : "gray"} onClick={() => setType("join")} fullSized>
          Join
        </Button>
        <Button color={type === "create" ? "dark" : "gray"} onClick={() => setType("create")} fullSized>
          Create
        </Button>
      </ButtonGroup>

      <div>
        <Label htmlFor="username" value="Your Name" />
        <TextInput
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toUpperCase())}
          placeholder="John"
          maxLength={20}
          required
        />
      </div>
      {type === "join" && (
        <div>
          <Label htmlFor="roomId" value="Room Code" />
          <TextInput
            id="roomId"
            name="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="ABCD"
            minLength={4}
            maxLength={4}
          />
        </div>
      )}

      <Button type="submit" className="mt-2" color="success">
        {type === "join" ? "Join Battle" : "Create a Battle"}
      </Button>
    </form>
  );
}
