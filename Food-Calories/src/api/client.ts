import createClient from "openapi-fetch";
import { type paths } from "./v1";
import { getDefaultStore } from "jotai";
import { accessTokenAtom } from "@/atoms/user";

class NotLoggedInError extends Error {}

interface AccessToken {
  sub: number;
  role: string;
  exp: Date;
}

function getJWTPayload<T>(jwt: string) {
  const parts = jwt.split(".");
  return JSON.parse(parts[1], (key, value) => {
    if (key == "exp") {
      return new Date(value);
    }
    return value;
  }) as T;
}

export const client = createClient<paths>({ baseUrl: "/" });

const unprotectedRoutes: (keyof paths)[] = [
  "/v1/register",
  "/v1/token",
  "/v1/logout",
  "/v1/refresh",
];

client.use({
  async onRequest({ request, schemaPath }) {
    if (unprotectedRoutes.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    const store = getDefaultStore();
    let accessToken = store.get(accessTokenAtom);
    if (!accessToken) {
      // User never logged in.
      throw new NotLoggedInError();
    }

    const info = getJWTPayload<AccessToken>(accessToken);
    if (info.exp.getTime() > Date.now()) {
      // Access token is expired, ask for a new one via /refresh.
      const { data, error } = await client.POST("/v1/refresh");
      if (error) {
        // If refreshing failed, we need the user to log in again.
        throw new NotLoggedInError();
      }
      accessToken = data.access_token;
      store.set(accessTokenAtom, accessToken);
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
});
