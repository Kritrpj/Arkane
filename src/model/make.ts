// Builds a Creature with sane defaults so tests and the harness only state what matters.
import type { Creature } from "./creature";
import type { Prop } from "./thing";
import { BODY } from "../data/bodies";
import { PROP_DEFAULT } from "../data/props";
import { resolvePropMass } from "../rules/propMass";

type Overrides = Omit<Partial<Creature>, "mod" | "save" | "hp"> & {
  mod?: Partial<Creature["mod"]>;
  save?: Partial<Creature["save"]>;
  hp?: Partial<Creature["hp"]>;
};

export function makeCreature(o: Overrides = {}): Creature {
  const size = o.size ?? "med";
  const zero = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  return {
    id: "c1", name: "Creature",
    pos: { col: 0, row: 0 }, footprint: 1, elevation: 0,
    size, mass: BODY[size].massLb, massSource: "size", speed: 30, ac: 10, prof: 2,
    conditions: [], tags: [],
    ...o,
    hp: { value: 10, max: 10, ...o.hp },
    mod: { ...zero, ...o.mod },
    save: { ...zero, ...o.save },
  };
}

// Same idea for props: only state what matters. Mass is worked out from material x size unless given.
export function makeProp(o: Partial<Prop> & { cellFt?: number; fill?: number } = {}): Prop {
  const { cellFt = 5, fill, ...rest } = o;
  const material = rest.material ?? PROP_DEFAULT.material, heightFt = rest.heightFt ?? PROP_DEFAULT.heightFt;
  const footprint = rest.footprint ?? 1;
  const m = resolvePropMass({ material, heightFt, footprint, cellFt, fill });
  return {
    id: "p1", name: "Prop", pos: { col: 0, row: 0 }, elevation: 0, tags: ["prop"],
    mass: m.mass, massSource: m.source,
    ...rest, material, heightFt, footprint,
  };
}
