import { client } from "@/api/client";
import { accessTokenAtom } from "@/atoms/user";
import { useAtom } from "jotai";
import { useNavigate } from "react-router";

export function useLogin() {
  const [, setAccessToken] = useAtom(accessTokenAtom);
  const navigate = useNavigate();

  return async (params: {
    username: string;
    password: string;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  }) => {
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

    if (error) {
      params.setErrorMessage(JSON.stringify(error));
      return;
    }

    setAccessToken(data.access_token);
    navigate("/");
  };
}
