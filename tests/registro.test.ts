import { describe, expect, it } from "vitest";
import { conCompendio } from "../src/cpr/registro";
import { PACK_ID, PRIORIDAD_MEDKIT } from "../src/constants";

const porDefecto = { "chris-premades": 1, "gambits-premades": 2, "midi-item-showcase-community": 3 };

describe("conCompendio", () => {
  it("añade el compendio detrás de las fuentes de Cauldron, Gambit's y MISC", () => {
    const r = conCompendio(porDefecto, PACK_ID, PRIORIDAD_MEDKIT);
    expect(r).toEqual({ ...porDefecto, [PACK_ID]: 4 });
    expect(Math.max(...Object.values(porDefecto))).toBeLessThan(PRIORIDAD_MEDKIT);
  });

  it("no toca nada si ya estaba, aunque tenga otra prioridad", () => {
    expect(conCompendio({ ...porDefecto, [PACK_ID]: 0 }, PACK_ID, PRIORIDAD_MEDKIT)).toBeNull();
  });

  it("funciona sin fuentes previas", () => {
    expect(conCompendio(undefined, PACK_ID, PRIORIDAD_MEDKIT)).toEqual({ [PACK_ID]: 4 });
  });

  it("no modifica el objeto original", () => {
    const original = { ...porDefecto };
    conCompendio(original, PACK_ID, PRIORIDAD_MEDKIT);
    expect(original).toEqual(porDefecto);
  });
});
