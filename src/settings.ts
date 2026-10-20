import { MODULE_ID, SETTING_COMPENDIO_REGISTRADO } from "./constants";

export function registerSettings(): void {
  // Una sola vez por mundo: si luego se quita el compendio a mano de las fuentes del Medkit, no se vuelve a añadir.
  game.settings.register(MODULE_ID, SETTING_COMPENDIO_REGISTRADO, {
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
}
