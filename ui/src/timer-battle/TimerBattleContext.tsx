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
  sendMessage: <E extends string, C extends unknown[], R = unknown>(methodName: E, ...args: C) => Promise<R> | undefined;
};

export const TimerBattleContext = createContext<Props>({} as Props);

const TimerBattleSignalRContext = createSignalRContext();

export function TimerBattleContextProvider({ children }: React.PropsWithChildren) {
  const [roomId, setRoomId] = useSessionStorageState<string>("roomId", { defaultValue: "" });
  const [username, setUsername] = useSessionStorageState<string>("username", { defaultValue: "" });
  const [battle, setBattle] = useState<TimerBattleRoom | undefined>(undefined);

  const sendMessage: <E extends string, C extends unknown[], R = unknown>(methodName: E, ...args: C) => Promise<R> | undefined = (
    methodName,
    ...args
  ) => {
    return TimerBattleSignalRContext.invoke(methodName, ...args)?.catch((reason) => console.error(reason));
  };

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
        sendMessage: sendMessage,
      }}
    >
      <TimerBattleSignalRContext.Provider
        url={"api/timerbattle/signalr"}
        onError={async (e) => {
          console.log("signalr err", e);
        }}
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
