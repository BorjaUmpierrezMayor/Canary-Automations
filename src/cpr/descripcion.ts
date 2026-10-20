import { MODULE_ID, PACK_ID } from "../constants";

export const RUTA_IDENTIFICADOR = "flags.chris-premades.info.identifier";
export const SEPARADOR = "<hr />";
const INICIO_NOTAS = `${SEPARADOR}<p><strong>`;

export function quitarNotas(html: string): string {
  const i = html.indexOf(INICIO_NOTAS);
  return (i >= 0 ? html.slice(0, i) : html).trim();
}

// Sin "soloNotas", la descripción del compendio va entera (trae el texto del libro). Con "soloNotas",
// el compendio solo aporta las notas: se queda el texto que ya tenía la ficha y las notas van detrás.
export function componerDescripcion(actual: string, delCompendio: string, soloNotas: boolean): string {
  if (!soloNotas) return delCompendio;
  const i = delCompendio.indexOf(SEPARADOR);
  const notas = i >= 0 ? delCompendio.slice(i) : `${SEPARADOR}${delCompendio}`;
  const libro = quitarNotas(actual ?? "");
  return libro ? `${libro}${notas}` : delCompendio;
}

// El Medkit conserva la descripción que ya tenía el rasgo en la ficha; el paso itemMedkit la
// rehace a partir de la del compendio, que es la única fuente de las notas.
export async function ponerDescripcionDelCompendio({ trigger: { entity: item } }: any): Promise<void> {
  const identificador = foundry.utils.getProperty(item, RUTA_IDENTIFICADOR);
  const pack = game.packs.get(PACK_ID);
  if (!identificador || !pack) return;
  const indice = await pack.getIndex({ fields: [RUTA_IDENTIFICADOR] });
  const entrada = indice.find((e: any) => foundry.utils.getProperty(e, RUTA_IDENTIFICADOR) === identificador);
  if (!entrada) return;
  const fuente = await pack.getDocument(entrada._id);
  const delCompendio = fuente?.system?.description?.value;
  if (!delCompendio) return;
  const html = componerDescripcion(item.system.description.value, delCompendio, fuente.flags?.[MODULE_ID]?.descripcion === "notas");
  if (item.system.description.value !== html) await item.update({ "system.description.value": html });
}
