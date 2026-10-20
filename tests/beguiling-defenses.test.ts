import { describe, expect, it } from "vitest";
import objeto from "../packs/_source/automations/beguiling-defenses.json";
import { PACK_ID } from "../src/constants";
import { IDENTIFICADOR, beguilingDefenses, decidir, mitadHaciaAbajo, type ContextoGolpe } from "../src/automations/beguiling-defenses";

const golpe: ContextoGolpe = {
  esImpacto: true,
  esAtaque: true,
  danioTotal: 8,
  atacanteEsOtro: true,
  reaccionUsada: false,
  incapacitado: false,
  puedeVer: true,
  usos: 1,
  espaciosPacto: 2
};

describe("mitadHaciaAbajo", () => {
  it.each([
    [5, 2],
    [8, 4],
    [9, 4],
    [1, 0],
    [0, 0],
    [-3, 0]
  ])("%i se queda en %i", (danio, esperado) => {
    expect(mitadHaciaAbajo(danio)).toBe(esperado);
  });
});

describe("decidir", () => {
  it("pregunta si usarlo cuando hay uso", () => {
    expect(decidir(golpe)).toBe("preguntarUso");
  });

  it("ofrece el espacio de Pacto cuando no quedan usos", () => {
    expect(decidir({ ...golpe, usos: 0 })).toBe("preguntarPacto");
  });

  it("no hace nada sin usos ni espacios de Pacto", () => {
    expect(decidir({ ...golpe, usos: 0, espaciosPacto: 0 })).toBe("nada");
  });

  it.each<[string, Partial<ContextoGolpe>]>([
    ["el ataque falla", { esImpacto: false }],
    ["no es un ataque", { esAtaque: false }],
    ["no hay daño", { danioTotal: 0 }],
    ["se golpea a sí mismo", { atacanteEsOtro: false }],
    ["ya gastó la reacción", { reaccionUsada: true }],
    ["está incapacitado (inconsciente, aturdido, paralizado...)", { incapacitado: true }],
    ["no ve al atacante", { puedeVer: false }]
  ])("no hace nada si %s", (_, cambio) => {
    expect(decidir({ ...golpe, ...cambio })).toBe("nada");
  });
});

describe("objeto del compendio", () => {
  const cpr = objeto.flags["chris-premades"];

  it("usa el mismo identificador que la macro", () => {
    expect(cpr.info.identifier).toBe(IDENTIFICADOR);
    expect(cpr.macros.midi.actor).toContain(IDENTIFICADOR);
    expect(beguilingDefenses().identifier).toBe(IDENTIFICADOR);
  });

  it("es un rasgo de reglas 2024, como pide el Medkit para encontrarlo", () => {
    expect(objeto.name).toBe("Beguiling Defenses");
    expect(objeto.type).toBe("feat");
    expect(objeto.system.source.rules).toBe("2024");
    expect(cpr.info.rules).toBe("modern");
    expect(beguilingDefenses().rules).toBe("modern");
  });

  it("los identificadores de actividad apuntan a actividades que existen", () => {
    const ids = Object.keys(objeto.system.activities);
    expect(ids).toContain(cpr.activityIdentifiers.use);
    expect(ids).toContain(cpr.activityIdentifiers.save);
  });

  it("la actividad de uso no es una reacción de midi, para no preguntar dos veces", () => {
    const uso = objeto.system.activities[cpr.activityIdentifiers.use as keyof typeof objeto.system.activities];
    expect(uso.activation.type).toBe("special");
  });

  it("la salvación es de Sabiduría contra la CD de conjuros, sin daño si se supera", () => {
    const salvacion = objeto.system.activities.bgDefSalvActivi0;
    expect(salvacion.save.ability).toEqual(["wis"]);
    expect(salvacion.save.dc.calculation).toBe("spellcasting");
    expect(salvacion.damage.onSave).toBe("none");
    expect(salvacion.damage.parts[0]?.types).toEqual(["psychic"]);
  });

  it("un uso por descanso largo e inmunidad a Encantado", () => {
    expect(objeto.system.uses.max).toBe("1");
    expect(objeto.system.uses.recovery[0]?.period).toBe("lr");
    const efecto = objeto.effects[0];
    expect(efecto?.transfer).toBe(true);
    expect(efecto?.changes[0]).toMatchObject({ key: "system.traits.ci.value", value: "charmed" });
  });

  it("las claves del compendio están bien formadas", () => {
    expect(objeto._key).toBe(`!items!${objeto._id}`);
    expect(objeto.effects[0]?._key).toBe(`!items.effects!${objeto._id}.${objeto.effects[0]?._id}`);
    for (const id of [objeto._id, ...Object.keys(objeto.system.activities), objeto.effects[0]?._id]) expect(id).toMatch(/^[a-zA-Z0-9]{16}$/);
  });

  it("la macro engancha cuando se va a aplicar el daño", () => {
    const pase = beguilingDefenses().midi.actor[0];
    expect(pase?.pass).toBe("targetApplyDamage");
  });

  it("declara su fuente, que el Medkit del actor exige para no saltarse el rasgo", () => {
    expect(cpr.info.source).toBe(PACK_ID);
  });

  it("al importarlo con el Medkit pone la descripción del compendio", () => {
    expect(beguilingDefenses().item.map((p) => p.pass)).toContain("itemMedkit");
    expect(cpr.macros.item).toContain(IDENTIFICADOR);
  });

  describe("descripción", () => {
    const [libro = "", notas = ""] = objeto.system.description.value.split("<hr />");
    const parrafos = (html: string) => html.match(/<p>.*?<\/p>/g) ?? [];

    it("el texto del libro va en tres párrafos, sin negritas", () => {
      expect(parrafos(libro)).toHaveLength(3);
      expect(libro).toContain("<p>You are immune to the Charmed condition.</p>");
      expect(libro).not.toContain("<strong>");
    });

    it("al final, tras una línea, cada cosa especial empieza en negrita", () => {
      expect(parrafos(notas).length).toBeGreaterThan(0);
      for (const p of parrafos(notas)) expect(p).toMatch(/^<p><strong>/);
    });
  });
});
