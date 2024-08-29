import { useContext, useMemo } from "react";
import { UserContext } from "./UserContext";
import { ErrorContext } from "./ErrorContext";

export default function useApiClient() {
  const { user } = useContext(UserContext);
  const { addError } = useContext(ErrorContext);

  const execute = async (url: string, options?: RequestInit) => {
    options ??= {};

    options.headers ??= [
      ["Authorization", `Bearer ${user?.idToken}`],
      ["Content-Type", "application/json"],
    ];

    try {
      const res = await fetch(url, options);
      if (!res.ok && res.status !== 404) throw new Error(`Error executing request: ${res.status}`);
      // TODO: refresh token if res.status is 403
      return { res: res, json: await res.json() };
    } catch (e) {
      addError(e as string);
      throw e;
    }
  };

  const getCurrentProfile = async (idToken: string) => {
    return await execute("/api/users/me", { headers: [["Authorization", `Bearer ${idToken}`]] });
  };

  const getGrid = async (gridId: string) => {
    return await execute(`/api/grids/${gridId}`);
  };

  const getLeaderboardEntryForGrid = async (gridId: string) => {
    return await execute(`/api/grids/${gridId}/leaderboards/entries/me`);
  };

  const createLeaderboardEntry = async (gridId: string, totalTime: number, penalties: number) => {
    const request = { totalTime: totalTime, penalties: penalties };
    return await execute(`/api/grids/${gridId}/leaderboards/entries`, { method: "POST", body: JSON.stringify(request) });
  };

  return useMemo(() => {
    return {
      getCurrentProfile,
      getGrid,
      getLeaderboardEntryForGrid,
      createLeaderboardEntry,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
}
