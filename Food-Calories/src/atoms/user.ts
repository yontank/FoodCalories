import { atomWithStorage } from "jotai/utils";

// TODO store more data later
export const userAtom = atomWithStorage<string | undefined>(
  "user",
  undefined,
  undefined,
  { getOnInit: true },
);
