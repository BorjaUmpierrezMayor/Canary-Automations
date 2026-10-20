import { AUTOMATIZACIONES } from "../automations";
import { MODULE_ID, PACK_ID, PRIORIDAD_MEDKIT, SETTING_COMPENDIO_REGISTRADO } from "../constants";

let registradas = false;

export function registrarMacros(): void {
  if (registradas) return;
  const registrar = (globalThis as any).chrisPremades?.utils?.macroUtils?.registerMacros;
  if (typeof registrar !== "function") return;
  registrar(AUTOMATIZACIONES.map((crear) => crear()));
  registradas = true;
}

export function conCompendio(fuentes: Record<string, number> | undefined, packId: string, prioridad: number): Record<string, number> | null {
  const actuales = fuentes ?? {};
  if (packId in actuales) return null;
  return { ...actuales, [packId]: prioridad };
}

export async function asegurarCompendioEnMedkit(): Promise<void> {
  if (!game.user?.isGM || game.users?.activeGM?.id !== game.user.id) return;
  if (game.settings.get(MODULE_ID, SETTING_COMPENDIO_REGISTRADO)) return;
  const nuevas = conCompendio(game.settings.get("chris-premades", "additionalCompendiums") as Record<string, number>, PACK_ID, PRIORIDAD_MEDKIT);
  if (nuevas) {
    await game.settings.set("chris-premades", "additionalCompendiums", nuevas);
    ui.notifications?.info(game.i18n.format("CANARYAUTOMATIONS.CompendioRegistrado", { prioridad: PRIORIDAD_MEDKIT }));
  }
  await game.settings.set(MODULE_ID, SETTING_COMPENDIO_REGISTRADO, true);
}
