import { atomWithStorage } from "jotai/utils";

export const accessTokenAtom = atomWithStorage<string | undefined>(
  "accessToken",
  undefined,
  undefined,
  { getOnInit: true },
);
