import { createContext, Dispatch, useContext, useState } from "react";
import { TimerBattleRoom } from "./Models";
import useSessionStorageState from "use-session-storage-state";
import { createSignalRContext } from "react-signalr";
import { Context, Hub } from "react-signalr/lib/signalr/types";
import { ErrorContext } from "../ErrorContext";
import { UserContext } from "../UserContext";

type Props = {
  roomId: string;
  setRoomId: Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<React.SetStateAction<string>>;
  battle: TimerBattleRoom | undefined;
  setBattle: Dispatch<React.SetStateAction<TimerBattleRoom | undefined>>;
  signalR: Context<Hub<string, string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: <E extends string, C extends any[], R = any>(methodName: E, ...args: C) => Promise<R> | undefined;
};

export const TimerBattleContext = createContext<Props>({} as Props);

const TimerBattleSignalRContext = createSignalRContext();

export function TimerBattleContextProvider({ children }: React.PropsWithChildren) {
  const { user } = useContext(UserContext);
  const [roomId, setRoomId] = useSessionStorageState<string>("roomId", { defaultValue: "" });
  const [username, setUsername] = useSessionStorageState<string>("username", { defaultValue: user?.username?.toUpperCase() ?? "" });
  const [battle, setBattle] = useState<TimerBattleRoom | undefined>(undefined);
  const { addError } = useContext(ErrorContext);

  const sendMessage: <E extends string, C extends unknown[], R = unknown>(methodName: E, ...args: C) => Promise<R> | undefined = (
    methodName,
    ...args
  ) => {
    return TimerBattleSignalRContext.invoke(methodName, ...args)?.catch((reason) => addError(reason.toString()));
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
