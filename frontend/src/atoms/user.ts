import { atomWithStorage } from "jotai/utils";
import i18next from "i18next";

export const accessTokenAtom = atomWithStorage<string | undefined>(
  "accessToken",
  undefined,
  undefined,
  { getOnInit: true },
);
