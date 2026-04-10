/**
 * Drift protection for design tokens.
 *
 * design-tokens.ts is the source of truth for React code (typed, `as const`).
 * tailwind.config.js holds the same values in the format NativeWind expects.
 *
 * These tests verify both files are in sync so a PR that changes one without
 * the other fails CI. If you change a token value, update BOTH files and
 * these tests will pass.
 */

import { tailwindTheme } from "../design-tokens";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require("../../../../tailwind.config.js");

const tailwindExtended = tailwindConfig.theme.extend;

describe("design-tokens sync with tailwind.config.js", () => {
  describe("colors", () => {
    it("primary colors match", () => {
      expect(tailwindExtended.colors.primary).toEqual(
        tailwindTheme.colors.primary,
      );
    });

    it("background colors match", () => {
      expect(tailwindExtended.colors.background).toEqual(
        tailwindTheme.colors.background,
      );
    });

    it("text colors match", () => {
      expect(tailwindExtended.colors.text).toEqual(tailwindTheme.colors.text);
    });

    it("surface colors match", () => {
      expect(tailwindExtended.colors.surface).toEqual(
        tailwindTheme.colors.surface,
      );
    });

    it("ui colors match", () => {
      expect(tailwindExtended.colors.ui).toEqual(tailwindTheme.colors.ui);
    });

    it("border colors match", () => {
      expect(tailwindExtended.colors.border).toEqual(
        tailwindTheme.colors.border,
      );
    });

    it("status colors match", () => {
      expect(tailwindExtended.colors.status).toEqual(
        tailwindTheme.colors.status,
      );
    });

    it("accent colors match", () => {
      expect(tailwindExtended.colors.accent).toEqual(
        tailwindTheme.colors.accent,
      );
    });

    it("light-mode colors match", () => {
      expect(tailwindExtended.colors.light).toEqual(tailwindTheme.colors.light);
    });
  });

  describe("spacing, radius, typography", () => {
    it("spacing matches", () => {
      expect(tailwindExtended.spacing).toEqual(tailwindTheme.spacing);
    });

    it("borderRadius matches", () => {
      expect(tailwindExtended.borderRadius).toEqual(tailwindTheme.borderRadius);
    });

    it("fontSize matches", () => {
      expect(tailwindExtended.fontSize).toEqual(tailwindTheme.fontSize);
    });
  });
});
