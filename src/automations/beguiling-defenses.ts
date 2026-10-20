import { HOOK_LOG } from "../constants";
import { ponerDescripcionDelCompendio } from "../cpr/descripcion";

export const IDENTIFICADOR = "canaryBeguilingDefenses";

export interface ContextoGolpe {
  esImpacto: boolean;
  esAtaque: boolean;
  danioTotal: number;
  atacanteEsOtro: boolean;
  reaccionUsada: boolean;
  incapacitado: boolean;
  puedeVer: boolean;
  usos: number;
  espaciosPacto: number;
}

export type Decision = "nada" | "preguntarUso" | "preguntarPacto";

export function decidir(c: ContextoGolpe): Decision {
  if (!c.esImpacto || !c.esAtaque || c.danioTotal <= 0) return "nada";
  if (!c.atacanteEsOtro || c.reaccionUsada || c.incapacitado || !c.puedeVer) return "nada";
  if (c.usos > 0) return "preguntarUso";
  return c.espaciosPacto > 0 ? "preguntarPacto" : "nada";
}

export function mitadHaciaAbajo(danio: number): number {
  return Math.floor(Math.max(0, danio) / 2);
}

function log(texto: string): void {
  Hooks.callAll(HOOK_LOG, texto);
}

async function alRecibirDanio({ trigger: { entity: item, token }, workflow, ditem }: any): Promise<void> {
  const { activityUtils, actorUtils, dialogUtils, genericUtils, socketUtils, workflowUtils } = chrisPremades.utils;
  const atacante = workflow.token;
  const decision = decidir({
    esImpacto: !!ditem?.isHit,
    esAtaque: !!workflowUtils.isAttackType(workflow, "attack"),
    danioTotal: ditem?.totalDamage ?? 0,
    atacanteEsOtro: !!atacante && atacante.document.uuid !== token.document.uuid,
    reaccionUsada: !!actorUtils.hasUsedReaction(item.actor),
    incapacitado: !!MidiQOL.checkIncapacitated?.(item.actor, false),
    puedeVer: !atacante || !MidiQOL.canSee || !!MidiQOL.canSee(token, atacante),
    usos: item.system.uses.value ?? 0,
    espaciosPacto: item.actor.system.spells?.pact?.value ?? 0
  });
  if (decision === "nada") return;
  const usuario = socketUtils.firstOwner(item.actor, true);
  if (decision === "preguntarPacto") {
    const pacto = item.actor.system.spells.pact.value;
    const texto = game.i18n.format("CANARYAUTOMATIONS.BeguilingDefenses.Restaurar", { nombre: item.name, quedan: pacto });
    if (!(await dialogUtils.confirm(item.name, texto, { userId: usuario }))) return;
    await genericUtils.update(item.actor, { "system.spells.pact.value": pacto - 1 });
    await genericUtils.update(item, { "system.uses.spent": 0 });
    log(`${item.name}: gasta un espacio de Pacto (quedan ${pacto - 1}) y recupera el uso`);
  }
  if (!(await dialogUtils.confirmUseItem(item, { userId: usuario }))) {
    log(`${item.name}: no se usa`);
    return;
  }
  const uso = activityUtils.getActivityByIdentifier(item, "use", { strict: true });
  if (!uso) return;
  await workflowUtils.syntheticActivityRoll(uso, [], { consumeUsage: true, consumeResources: true, userId: usuario });
  if (game.combat) await actorUtils.setReactionUsed(item.actor);
  const antes = ditem.totalDamage;
  workflowUtils.modifyDamageAppliedFlat(ditem, -(antes - mitadHaciaAbajo(antes)));
  const recibido = ditem.totalDamage;
  log(`${item.name}: daño ${antes} se reduce a ${recibido}`);
  const salvacion = activityUtils.getActivityByIdentifier(item, "save", { strict: true });
  if (!salvacion || recibido <= 0) return;
  const datos = genericUtils.duplicate(salvacion.toObject());
  datos.damage.parts[0].custom = { enabled: true, formula: String(recibido) };
  const resultado = await workflowUtils.syntheticActivityDataRoll(datos, item, item.actor, [atacante]);
  const falla = resultado?.failedSaves?.size > 0;
  log(`${item.name}: ${atacante.name} ${falla ? `falla la salvación de Sabiduría y recibe ${recibido} psíquico` : "supera la salvación de Sabiduría"}`);
}

export function beguilingDefenses() {
  return {
    identifier: IDENTIFICADOR,
    name: "Beguiling Defenses",
    version: "0.1.0",
    rules: "modern",
    midi: {
      actor: [{ pass: "targetApplyDamage", macro: alRecibirDanio, priority: 100 }]
    },
    item: [{ pass: "itemMedkit", macro: ponerDescripcionDelCompendio, priority: 50 }]
  };
}
