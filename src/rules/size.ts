import { SIZES, type SizeKey } from "../model/creature";

export const Size = {
  index: (s: SizeKey): number => SIZES.indexOf(s),
};
