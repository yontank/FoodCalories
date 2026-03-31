/**
 * Read the access token from localStorage (stored by Jotai atomWithStorage).
 */

import { accessTokenAtom } from "@/atoms/user";
import { getDefaultStore } from "jotai";

export function getToken(): string {
  const store = getDefaultStore();
  const raw = store.get(accessTokenAtom);
  if (!raw) return "";
  try {
    return JSON.parse(raw) as string;
  } catch {
    return raw;
  }
}
