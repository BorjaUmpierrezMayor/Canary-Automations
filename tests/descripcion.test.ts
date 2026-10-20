import { describe, expect, it } from "vitest";
import { componerDescripcion, quitarNotas } from "../src/cpr/descripcion";

const notas = "<hr /><p><strong>Automated:</strong> algo.</p>";
const compendio = `<p>Resumen propio.</p>${notas}`;

describe("componerDescripcion", () => {
  it("con el texto del libro en el compendio, lo pone entero", () => {
    expect(componerDescripcion("<p>Texto viejo.</p>", compendio, false)).toBe(compendio);
  });

  it("en modo notas conserva el texto de la ficha y añade las notas", () => {
    expect(componerDescripcion("<p>Texto del libro.</p><p>Segundo párrafo.</p>", compendio, true))
      .toBe(`<p>Texto del libro.</p><p>Segundo párrafo.</p>${notas}`);
  });

  it("no duplica las notas si se vuelve a pasar el Medkit", () => {
    const una = componerDescripcion("<p>Texto del libro.</p>", compendio, true);
    expect(componerDescripcion(una, compendio, true)).toBe(una);
  });

  it("si la ficha no tenía texto, usa el del compendio", () => {
    expect(componerDescripcion("", compendio, true)).toBe(compendio);
  });

  it("quitarNotas deja solo lo de antes de las notas", () => {
    expect(quitarNotas(`<p>Libro.</p>${notas}`)).toBe("<p>Libro.</p>");
    expect(quitarNotas("<p>Libro.</p><hr /><p>Otra sección sin negrita.</p>")).toBe("<p>Libro.</p><hr /><p>Otra sección sin negrita.</p>");
  });
});
