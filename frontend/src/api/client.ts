import createClient from "openapi-fetch";
import createReactClient from "openapi-react-query";
import { type paths } from "./v1";
import { getDefaultStore } from "jotai";
import { accessTokenAtom } from "@/atoms/user";
import { jwtDecode } from "jwt-decode";

export class NotLoggedInError extends Error {}

export const client = createClient<paths>({ baseUrl: "/" });
export const reactClient = createReactClient(client);

const unprotectedRoutes: (keyof paths)[] = [
  "/api/v1/register",
  "/api/v1/token",
  "/api/v1/logout",
  "/api/v1/refresh",
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
      console.warn("User is not logged in.");
      throw new NotLoggedInError();
    }

    const info = jwtDecode(accessToken);
    if (!info.exp || info.exp < Date.now() / 1000) {
      // Access token is expired, ask for a new one via /refresh.
      console.log("Access token is expired.");
      const { data, error } = await client.POST("/api/v1/refresh");
      if (error) {
        // If refreshing failed, we need the user to log in again.
        console.warn("Access token could not be refreshed.");
        throw new NotLoggedInError();
      }
      console.log("Access token refreshed.");
      accessToken = data.access_token;
      store.set(accessTokenAtom, accessToken);
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
});
