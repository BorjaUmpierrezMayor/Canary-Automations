# Canary - Automations

Automatizaciones propias para **dnd5e + midi-qol** que se importan con el **Medkit de Cauldron of Plentiful Resources (CPR)**, igual que las de Cauldron, Gambit's Premades o Midi Item Showcase.

Foundry VTT 13, dnd5e 5.x. Requiere `chris-premades` y `midi-qol`. Sin interfaz propia.

## Instalar

En Foundry: *Add-on Modules → Install Module*, y en **Manifest URL**:

```
https://github.com/BorjaUmpierrezMayor/Canary-Automations/releases/latest/download/module.json
```

Actívalo en el mundo. La primera vez que un GM lo carga, su compendio se añade a las fuentes del Medkit con prioridad 4, detrás de Cauldron (1), Gambit's (2) y MISC (3): el Medkit solo propone estas automatizaciones cuando ninguna de esas fuentes tiene el rasgo. Se hace una vez; si luego lo quitas de las fuentes a mano, no vuelve.

## Automatizaciones

| Rasgo | Reglas | Qué hace |
|---|---|---|
| Beguiling Defenses (Warlock, Archfey Patron 10) | 2024 | Inmune a Hechizado. Cuando una criatura que ves te golpea con una tirada de ataque, si tienes la reacción y no estás incapacitado, pregunta si usarlo: el daño se queda en la mitad (hacia abajo) y el atacante hace una salvación de Sabiduría contra tu CD de conjuros; si falla, recibe daño psíquico igual al que recibes tú. Un uso por descanso largo; sin usos, ofrece gastar un espacio de Magia de Pacto para recuperarlo. |

Para usarla: en la ficha, el rasgo tiene que llamarse igual que en el compendio ("Beguiling Defenses") y ser de reglas 2024. Abre el Medkit (en la ficha del rasgo o del actor) y aplica la fuente "Canary - Automations". La descripción queda con el texto del libro en párrafos y, al final, las particularidades de la automatización en negrita.

## Cómo funciona

- **Compendio `canary-automations.automations`**: los rasgos preparados, con actividades, efectos y flags de CPR (`info.identifier`, `info.source`, `macros`, `activityIdentifiers`). La fuente está en `packs/_source/automations/*.json`; `npm run build` lo compila a `packs/automations` (LevelDB).
- **Macros** (`src/automations/`): se registran en CPR con `chrisPremades.utils.macroUtils.registerMacros`. Los identificadores llevan el prefijo `canary` para no pisar nunca una macro de Cauldron con el mismo nombre.
- **Descripción al importar**: el Medkit conserva el texto que el rasgo ya tenía en la ficha, así que cada automatización registra el paso `itemMedkit`, que pone la descripción del compendio.
- **Fuente declarada** (`info.source`): sin ella, el Medkit del actor ("actualizar todo") se salta el rasgo.

## Desarrollo

```
npm install
npm run build      # dist/canary-automations.mjs + packs/automations
npm test           # Vitest
```

El compendio no se puede recompilar mientras un mundo abierto lo tenga cargado (LevelDB bloqueado); el script solo lo recompila si cambió su JSON.

## Publicar una versión

Sube el cambio de `version` en `module.json` y una etiqueta con el mismo número:

```
git tag v0.1.1
git push origin v0.1.1
```

El flujo `.github/workflows/release.yml` pasa las pruebas, compila y crea la release con `module.json` y `module.zip`. Foundry detecta la actualización desde la URL del manifest.
