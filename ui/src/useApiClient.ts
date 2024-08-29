import { useContext } from "react";
import { UserContext } from "./UserContext";
import { ErrorContext } from "./ErrorContext";

export default function useApiClient() {
  const { user } = useContext(UserContext);
  const { addError } = useContext(ErrorContext);

  const execute = async (url: string, options?: RequestInit) => {
    if (options) {
      options.headers ??= [["Authorization", `Bearer ${user?.idToken}`]];
    }
    try {
      const res = await fetch(url, options);
      if (res.status >= 400) throw new Error(`Error executing request: ${res.status}`);
      // TODO: refresh token if res.status is 403
      return res.json();
    } catch (e) {
      addError(e as string);
      throw e;
    }
  };

  const getCurrentProfile = async (idToken: string) => {
    return await execute("/api/users/me", { headers: [["Authorization", `Bearer ${idToken}`]] });
  };

  return {
    getCurrentProfile,
  };
}
