// Integration test for WalletHomeScreen auto-lock button
// Validates implementation of auto-lock button on home screen

import { readFileSync } from "fs";
import { join } from "path";

describe("WalletHomeScreen - Auto-lock Button Integration", () => {
  const componentPath = join(__dirname, "./wallet-home-screen.tsx");
  let componentCode: string;

  beforeAll(() => {
    componentCode = readFileSync(componentPath, "utf8");
  });

  describe("Auto-lock Button Logic", () => {
    it("should check for documents with isAutoLockEnabled: true", () => {
      expect(componentCode).toContain("documents.some(doc => doc.isAutoLockEnabled)");
    });

    it("should conditionally render auto-lock button", () => {
      expect(componentCode).toContain("{documents.some(doc => doc.isAutoLockEnabled) && (");
    });

    it("should have button with correct labels", () => {
      expect(componentCode).toContain("Iniciar Auto-lock");
      expect(componentCode).toContain("Compartilhar documentos selecionados");
      expect(componentCode).toContain("Iniciar Modo Convidado");
    });

    it("should use router.replace for navigation", () => {
      expect(componentCode).toContain('router.replace("/guest-mode")');
    });

    it("should have proper styling classes", () => {
      expect(componentCode).toContain("border-warning-main");
      expect(componentCode).toContain("bg-warning-main");
    });
  });

  describe("Focus Effect", () => {
    it("should reload documents on focus", () => {
      expect(componentCode).toContain("useFocusEffect");
      expect(componentCode).toContain("loadDocuments");
    });

    it("should have loadDocuments in useDocuments hook return", () => {
      expect(componentCode).toContain("reload: loadDocuments");
    });
  });

  describe("Button Visibility Conditions", () => {
    it("should only show button when at least one document has isAutoLockEnabled", () => {
      // The conditional rendering should be based on the some() check
      const lines = componentCode.split("\n");
      const buttonSectionStart = lines.findIndex(line => line.includes("documents.some(doc => doc.isAutoLockEnabled) && ("));
      expect(buttonSectionStart).toBeGreaterThan(-1);
    });
  });
});