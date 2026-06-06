export const FONT_OPTIONS = ["Montserrat", "Anton", "Bebas Neue", "Poppins", "Oswald"] as const;
export type FontOption = (typeof FONT_OPTIONS)[number];

// Muss mit FONT_MAP in remotion/src/Caption.tsx übereinstimmen.
export function fontCss(name?: string): string {
  switch (name) {
    case "Anton":
      return "'Anton', sans-serif";
    case "Bebas Neue":
      return "'Bebas Neue', sans-serif";
    case "Poppins":
      return "'Poppins', sans-serif";
    case "Oswald":
      return "'Oswald', sans-serif";
    default:
      return "'Montserrat', sans-serif";
  }
}
