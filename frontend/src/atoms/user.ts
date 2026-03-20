import { atomWithStorage } from "jotai/utils";
import i18next from 'i18next'

export const accessTokenAtom = atomWithStorage<string | undefined>(
  i18next.t('accesstoken', 'accessToken'),
  undefined,
  undefined,
  { getOnInit: true },
);
