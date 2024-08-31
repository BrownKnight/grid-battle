import { useContext, useMemo } from "react";
import { UserContext } from "./UserContext";
import { ErrorContext } from "./ErrorContext";

export default function useApiClient() {
  const { isLoggedIn, user, refreshToken } = useContext(UserContext);
  const { addError } = useContext(ErrorContext);

  const execute = async (url: string, options?: RequestInit) => {
    options ??= {};

    options.headers ??= [
      ["Authorization", `Bearer ${user?.idToken}`],
      ["Content-Type", "application/json"],
    ];

    try {
      let res = await fetch(url, options);

      if (user?.idToken && res.status === 403) {
        console.log("Got a 403 from API, refreshing token before trying again");
        const newToken = await refreshToken();
        options.headers = [
          ["Authorization", `Bearer ${newToken}`],
          ["Content-Type", "application/json"],
        ];
        res = await fetch(url, options);
      }

      if (!res.ok && res.status !== 404) throw new Error(`Error executing request: ${res.status}`);
      const json = res.status === 404 ? undefined : await res.json();
      return { res, json };
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

  const getMyLeaderboardEntryForGrid = async (gridId: string) => {
    return await execute(`/api/grids/${gridId}/leaderboards/entries/me`);
  };

  const getMySubcribedLeaderboards = async () => {
    return await execute(`/api/users/me/leaderboards`);
  };

  const getLeaderboardEntriesForGrid = async (gridId: string, leaderboardId: string, offset: number, limit: number) => {
    return await execute(`/api/grids/${gridId}/leaderboards/${leaderboardId}/entries?offset=${offset}&limit=${limit}`);
  };

  const createLeaderboardEntry = async (gridId: string, totalTime: number, penalties: number) => {
    const request = { totalTime: totalTime, penalties: penalties };
    return await execute(`/api/grids/${gridId}/leaderboards/entries`, { method: "POST", body: JSON.stringify(request) });
  };

  const joinLeaderboard = async (leaderboardId: string) => {
    return await execute(`/api/leaderboards/${leaderboardId}`, { method: "POST" });
  };

  const createLeaderboard = async (name: string) => {
    const request = { name };
    return await execute(`/api/leaderboards`, { method: "POST", body: JSON.stringify(request) });
  };

  return useMemo(() => {
    return {
      getCurrentProfile,
      getGrid,
      getMyLeaderboardEntryForGrid,
      createLeaderboardEntry,
      getMySubcribedLeaderboards,
      getLeaderboardEntriesForGrid,
      joinLeaderboard,
      createLeaderboard,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);
}
