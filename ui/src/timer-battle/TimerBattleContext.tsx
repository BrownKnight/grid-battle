import { createContext, Dispatch, useState } from "react";
import { TimerBattleRoom } from "./Models";
import useSessionStorageState from "use-session-storage-state";
import { createSignalRContext } from "react-signalr";
import { Context, Hub } from "react-signalr/lib/signalr/types";

type Props = {
  roomId: string;
  setRoomId: Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<React.SetStateAction<string>>;
  battle: TimerBattleRoom | undefined;
  setBattle: Dispatch<React.SetStateAction<TimerBattleRoom | undefined>>;
  signalR: Context<Hub<string, string>>;
};

export const TimerBattleContext = createContext<Props>({} as Props);

const TimerBattleSignalRContext = createSignalRContext();

export function TimerBattleContextProvider({ children }: React.PropsWithChildren) {
  const [roomId, setRoomId] = useSessionStorageState<string>("roomId", { defaultValue: "" });
  const [username, setUsername] = useSessionStorageState<string>("username", { defaultValue: "" });
  const [battle, setBattle] = useState<TimerBattleRoom | undefined>(undefined);

  return (
    <TimerBattleContext.Provider
      value={{
        roomId: roomId,
        setRoomId: setRoomId,
        username: username,
        setUsername: setUsername,
        battle: battle,
        setBattle: setBattle,
        signalR: TimerBattleSignalRContext,
      }}
    >
      <TimerBattleSignalRContext.Provider
        url={"api/timerbattle/signalr"}
        onClosed={(e) => {
          console.error(e);
          setBattle(undefined);
        }}
      >
        {children}
      </TimerBattleSignalRContext.Provider>
    </TimerBattleContext.Provider>
  );
}
