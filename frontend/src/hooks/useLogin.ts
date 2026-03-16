import { client } from "@/api/client";
import { accessTokenAtom } from "@/atoms/user";
import { useAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router";

export function useLogin() {
  const [, setAccessToken] = useAtom(accessTokenAtom);
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  const login = async (params: {
    username: string;
    password: string;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  }) => {
    setInProgress(true);

    const { data, error } = await client.POST("/api/v1/token", {
      body: {
        username: params.username,
        password: params.password,
        scope: "",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    setInProgress(false);

    if (error) {
      params.setErrorMessage(JSON.stringify(error));
      return;
    }

    setAccessToken(data.access_token);
    navigate("/");
  };

  return { login, inProgress };
}
