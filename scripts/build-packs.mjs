import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const fuentes = path.join(raiz, "packs", "_source");
const ficheroHuellas = path.join(raiz, "packs", ".huellas.json");
const huellas = existsSync(ficheroHuellas) ? JSON.parse(await readFile(ficheroHuellas, "utf-8")) : {};

async function huella(carpeta) {
  const hash = createHash("sha256");
  for (const fichero of (await readdir(carpeta)).sort()) hash.update(fichero).update(await readFile(path.join(carpeta, fichero)));
  return hash.digest("hex");
}

for (const nombre of await readdir(fuentes)) {
  const origen = path.join(fuentes, nombre);
  const destino = path.join(raiz, "packs", nombre);
  const actual = await huella(origen);
  if (huellas[nombre] === actual && existsSync(destino)) {
    console.log(`[canary-automations] compendio "${nombre}" al día, no se recompila`);
    continue;
  }
  try {
    await compilePack(origen, destino, { log: true });
    huellas[nombre] = actual;
  } catch (e) {
    console.error(`[canary-automations] no se pudo compilar el compendio "${nombre}": ${e.message}`);
    console.error("Si Foundry tiene el módulo activo en un mundo abierto, el compendio está bloqueado: desactívalo o cierra el mundo y vuelve a compilar.");
    process.exitCode = 1;
  }
}
await writeFile(ficheroHuellas, JSON.stringify(huellas, null, 2) + "\n");
