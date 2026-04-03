import { accessTokenAtom } from "@/atoms/user";
import { CredentialResponse } from "@react-oauth/google";
import { useAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router";

export function useGoogleLogin() {
  const [, setAccessToken] = useAtom(accessTokenAtom);
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  const googleLogin = async (params: {
    token: CredentialResponse;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  }) => {
    setInProgress(true);

    try {
      const res = await fetch("/api/v1/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.token),
      });

      const data = await res.json();

      if (!res.ok) {
        params.setErrorMessage(data.message ?? "Google login failed");
        return;
      }

      setAccessToken(data.access_token);
      navigate("/");
    } catch {
      params.setErrorMessage("Google login failed");
    } finally {
      setInProgress(false);
    }
  };

  return { googleLogin, inProgress };
}
