import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AUTOMATIZACIONES } from "../src/automations";
import { PACK_ID } from "../src/constants";

const carpeta = path.resolve(import.meta.dirname, "../packs/_source/automations");
const objetos = readdirSync(carpeta).filter((f) => f.endsWith(".json")).map((f) => ({ fichero: f, datos: JSON.parse(readFileSync(path.join(carpeta, f), "utf-8")) }));
const macros = AUTOMATIZACIONES.map((crear) => crear() as any);

describe.each(objetos)("$fichero", ({ datos }) => {
  const cpr = datos.flags["chris-premades"];
  const macro = macros.find((m) => m.identifier === cpr.info.identifier);

  it("tiene una macro registrada con su identificador, nombre y reglas", () => {
    expect(macro).toBeDefined();
    expect(macro.name).toBe(datos.name);
    expect(macro.rules).toBe("modern");
    expect(datos.system.source.rules).toBe("2024");
    expect(cpr.info.rules).toBe("modern");
  });

  it("declara la fuente del Medkit y la misma versión que la macro", () => {
    expect(cpr.info.source).toBe(PACK_ID);
    expect(cpr.info.version).toBe(macro.version);
  });

  it("los flags de macros cubren todos los pasos que registra la macro", () => {
    if (macro.midi?.actor) expect(cpr.macros.midi.actor).toContain(macro.identifier);
    if (macro.midi?.item) expect(cpr.macros.midi.item).toContain(macro.identifier);
    if (macro.item) expect(cpr.macros.item).toContain(macro.identifier);
    if (macro.aura) expect(cpr.macros.aura).toContain(macro.identifier);
    if (macro.combat) expect(datos.effects.some((e: any) => e.flags?.["chris-premades"]?.macros?.combat?.includes(macro.identifier))).toBe(true);
  });

  it("al importarlo con el Medkit rehace la descripción", () => {
    expect(macro.item.map((p: any) => p.pass)).toContain("itemMedkit");
  });

  it("ids y claves del compendio bien formados", () => {
    expect(datos._key).toBe(`!items!${datos._id}`);
    const ids = [datos._id, ...Object.keys(datos.system.activities), ...datos.effects.map((e: any) => e._id)];
    for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9]{16}$/);
    for (const e of datos.effects) expect(e._key).toBe(`!items.effects!${datos._id}.${e._id}`);
    for (const [id, a] of Object.entries<any>(datos.system.activities)) {
      expect(a._id).toBe(id);
      for (const ref of a.effects ?? []) expect(datos.effects.map((e: any) => e._id)).toContain(ref._id);
    }
  });

  it("los efectos con macro de combate dicen que son de reglas 2024", () => {
    for (const e of datos.effects.filter((x: any) => x.flags?.["chris-premades"]?.macros)) expect(e.flags["chris-premades"].rules).toBe("modern");
  });

  it("descripción: el resumen o el texto del libro, una línea y notas que empiezan en negrita", () => {
    const [antes = "", notas = ""] = datos.system.description.value.split("<hr />");
    expect(antes).toMatch(/^<p>.+<\/p>$/);
    expect(antes).not.toContain("<strong>");
    const parrafos = notas.match(/<p>.*?<\/p>/g) ?? [];
    expect(parrafos.length).toBeGreaterThan(0);
    for (const p of parrafos) expect(p).toMatch(/^<p><strong>/);
  });
});

it("cada macro registrada tiene su objeto en el compendio", () => {
  const enCompendio = objetos.map((o) => o.datos.flags["chris-premades"].info.identifier);
  for (const m of macros) expect(enCompendio).toContain(m.identifier);
});
