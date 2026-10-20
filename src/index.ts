import { asegurarCompendioEnMedkit, registrarMacros } from "./cpr/registro";
import { registerSettings } from "./settings";

Hooks.once("cprInitComplete", registrarMacros);

Hooks.once("init", registerSettings);

Hooks.once("setup", registrarMacros);

Hooks.once("ready", () => {
  registrarMacros();
  void asegurarCompendioEnMedkit();
});
