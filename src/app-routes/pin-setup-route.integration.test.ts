/**
 * Integration test for app/pin-setup.tsx route
 * Validates that the pin-setup route correctly renders PinSetupScreen
 */

import * as fs from "fs";
import * as path from "path";

describe("Pin Setup Route (app/pin-setup.tsx)", () => {
  const projectRoot = path.resolve(__dirname, "../..");
  const pinSetupRoutePath = path.join(projectRoot, "app/pin-setup.tsx");
  const layoutPath = path.join(projectRoot, "app/_layout.tsx");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("File Structure", () => {
    it("should exist at app/pin-setup.tsx", () => {
      expect(fs.existsSync(pinSetupRoutePath)).toBe(true);
    });

    it("should be a TypeScript/TSX file", () => {
      const fileName = path.basename(pinSetupRoutePath);
      expect(fileName).toMatch(/\.tsx$/);
    });
  });

  describe("Imports", () => {
    it("should import PinSetupScreen", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).toContain("PinSetupScreen");
    });

    it("should import from presentation/screens path", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).toContain("pin-setup-screen");
    });
  });

  describe("Component Definition", () => {
    it("should export default function PinSetupRoute", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).toContain("export default function PinSetupRoute");
    });

    it("should return JSX element", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).toContain("return <");
    });

    it("should render PinSetupScreen component", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).toContain("<PinSetupScreen");
    });
  });

  describe("Route Registration", () => {
    it("should be registered in _layout.tsx", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      expect(layoutContent).toContain('name="pin-setup"');
    });

    it("should be ordered after splash route", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      const splashIndex = layoutContent.indexOf('name="splash"');
      const pinSetupIndex = layoutContent.indexOf('name="pin-setup"');
      expect(splashIndex).toBeLessThan(pinSetupIndex);
    });

    it("should have header hidden in layout", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      expect(layoutContent).toContain("pin-setup");
      expect(layoutContent).toContain("headerShown: false");
    });
  });

  describe("Navigation Flow", () => {
    it("should be reachable from SplashScreen", () => {
      const indexPath = path.join(
        path.dirname(__dirname),
        "..",
        "app/index.tsx",
      );
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, "utf8");
        expect(indexContent).toContain("/pin-setup");
      }
    });
  });

  describe("Code Quality", () => {
    it("should be a simple wrapper component", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      const lines = fileContent.trim().split("\n");
      expect(lines.length).toBeLessThan(10);
    });

    it("should not have state management", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).not.toContain("useState");
    });

    it("should not have effects", () => {
      const fileContent = fs.readFileSync(pinSetupRoutePath, "utf8");
      expect(fileContent).not.toContain("useEffect");
    });
  });
});
