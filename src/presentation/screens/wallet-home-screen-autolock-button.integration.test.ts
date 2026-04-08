/**
 * Integration test for WalletHomeScreen auto-lock button removal
 * Validates that auto-lock button has been removed from home screen
 * Tests that TASK-4 (remove auto-lock container) is properly implemented
 */

import { readFileSync } from "fs";
import { join } from "path";

describe("WalletHomeScreen - Auto-lock Button Removal Integration Tests", () => {
  const componentPath = join(__dirname, "./wallet-home-screen.tsx");
  let componentCode: string;

  beforeAll(() => {
    componentCode = readFileSync(componentPath, "utf8");
  });

  describe("Auto-lock Button Removal Validation", () => {
    it("should NOT contain auto-lock button conditional rendering", () => {
      expect(componentCode).not.toContain(
        "documents.some((doc) => doc.isAutoLockEnabled)",
      );
    });

    it("should NOT contain auto-lock button container", () => {
      expect(componentCode).not.toContain(
        'className="border-2 border-warning-main rounded-2xl p-5 md:p-6 mb-6"',
      );
    });

    it("should NOT display auto-lock icon emoji", () => {
      expect(componentCode).not.toContain("🔒");
    });

    it("should NOT display main button title in Portuguese", () => {
      expect(componentCode).not.toContain("Iniciar Auto-lock");
    });

    it("should NOT display button subtitle text", () => {
      expect(componentCode).not.toContain(
        "Compartilhar documentos selecionados",
      );
    });

    it("should NOT display action button text in Portuguese", () => {
      expect(componentCode).not.toContain("Iniciar Modo Convidado");
    });

    it("should NOT have auto-lock button styling", () => {
      expect(componentCode).not.toContain(
        'className="bg-warning-main rounded-xl py-3.5 items-center active:opacity-90"',
      );
    });
  });

  describe("Navigation Implementation", () => {
    it("should NOT use router.replace() for guest-mode navigation in auto-lock context", () => {
      // The component should not have router.replace("/guest-mode") for auto-lock button
      // It might still exist elsewhere in the codebase, but not for auto-lock
      const lines = componentCode.split("\n");
      const guestModeLines = lines.filter((line) =>
        line.includes('router.replace("/guest-mode")'),
      );
      expect(guestModeLines.length).toBe(0);
    });
  });

  describe("Focus Effect Implementation", () => {
    it("should import useFocusEffect from expo-router", () => {
      expect(componentCode).toContain("useFocusEffect");
    });

    it("should extract loadDocuments from useDocuments hook", () => {
      expect(componentCode).toContain("reload: loadDocuments");
    });

    it("should call useFocusEffect with React.useCallback", () => {
      expect(componentCode).toContain("useFocusEffect(");
      expect(componentCode).toContain("React.useCallback");
    });

    it("should reload documents on focus effect", () => {
      expect(componentCode).toContain("loadDocuments();");
    });

    it("should reload profile on focus effect", () => {
      expect(componentCode).toContain("reloadProfile();");
    });
  });

  describe("Hook Integration", () => {
    it("should destructure reload from useDocuments hook", () => {
      expect(componentCode).toContain("reload: loadDocuments");
    });

    it("should have useRouter hook imported and used", () => {
      expect(componentCode).toContain("const router = useRouter()");
    });
  });

  describe("Secure Sharing Button Validation", () => {
    it("should have secure sharing button with correct styling", () => {
      expect(componentCode).toContain(
        'className="bg-white rounded-xl py-3.5 items-center active:opacity-90"',
      );
    });

    it("should have secure sharing button text", () => {
      expect(componentCode).toContain("Start Sharing");
    });

    it("should navigate to select-documents from secure sharing button", () => {
      expect(componentCode).toContain('router.push("/select-documents")');
    });
  });

  describe("Complete Feature Validation (TASK-4 Definition of DONE)", () => {
    it("✓ Auto-lock button removed from WalletHomeScreen", () => {
      expect(componentCode).not.toContain("Iniciar Auto-lock");
    });

    it("✓ Secure sharing flow remains accessible via 'Start Sharing' button", () => {
      expect(componentCode).toContain("Start Sharing");
      expect(componentCode).toContain('router.push("/select-documents")');
    });

    it("✓ No redundant entry points for guest mode", () => {
      const guestModeCount = (componentCode.match(/guest-mode/g) || []).length;
      expect(guestModeCount).toBe(0);
    });
  });
});
