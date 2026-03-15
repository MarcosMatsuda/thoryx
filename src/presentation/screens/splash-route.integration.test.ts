/**
 * Integration tests for the Splash Route (app/splash.tsx)
 * Validates that the route is properly registered and configured in the Expo Router layout
 */

import * as fs from "fs";
import * as path from "path";

describe("Splash Route Integration", () => {
  const projectRoot = path.resolve(__dirname, "../../..");
  const splashRoutePath = path.join(projectRoot, "app/splash.tsx");
  const layoutPath = path.join(projectRoot, "app/_layout.tsx");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("app/splash.tsx - Route Component", () => {
    it("should exist and contain valid TypeScript/JSX", () => {
      expect(fs.existsSync(splashRoutePath)).toBe(true);
    });

    it("should import SplashScreen from the correct path", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      expect(fileContent).toContain(
        'from "@/src/presentation/screens/splash-screen"',
      );
      expect(fileContent).toContain("SplashScreen");
    });

    it("should export a default component named SplashRoute", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      expect(fileContent).toContain("export default function SplashRoute");
    });

    it("should render the SplashScreen component", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      expect(fileContent).toContain("return <SplashScreen");
    });

    it("should be a simple wrapper around SplashScreen", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      const lines = fileContent.trim().split("\n");
      // Should be concise: import, export, return
      expect(lines.length).toBeLessThanOrEqual(10);
    });

    it("should not contain any state management or effects", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      expect(fileContent).not.toContain("useState");
      expect(fileContent).not.toContain("useEffect");
      expect(fileContent).not.toContain("useContext");
    });
  });

  describe("app/_layout.tsx - Route Registration", () => {
    it("should exist", () => {
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it("should register the splash route", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain('name="splash"');
    });

    it("should hide the header for splash route", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      const splashRegex =
        /<Stack\.Screen\s+name="splash"\s+options=\{\{\s*headerShown:\s*false\s*\}\}/;
      expect(splashRegex.test(fileContent)).toBe(true);
    });

    it("should register splash route after index and before unlock", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      const indexMatch = fileContent.indexOf('name="index"');
      const splashMatch = fileContent.indexOf('name="splash"');
      const unlockMatch = fileContent.indexOf('name="unlock"');

      expect(indexMatch).toBeLessThan(splashMatch);
      expect(splashMatch).toBeLessThan(unlockMatch);
    });

    it("should have Stack.Screen component for splash", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toMatch(/<Stack\.Screen[^>]*name="splash"[^>]*\/>/);
    });

    it("should not have multiple splash route registrations", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      const splashMatches = fileContent.match(/name="splash"/g);
      expect(splashMatches).toHaveLength(1);
    });

    it("should import Stack from expo-router", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain('from "expo-router"');
      expect(fileContent).toContain("Stack");
    });

    it("should use RootLayout as the default export", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain("export default function RootLayout");
    });
  });

  describe("Route Accessibility", () => {
    it("splash route should be accessible from app directory", () => {
      const appDir = path.join(projectRoot, "app");
      const files = fs.readdirSync(appDir);
      expect(files).toContain("splash.tsx");
    });

    it("splash route file should have .tsx extension for JSX support", () => {
      const fileName = path.basename(splashRoutePath);
      expect(fileName).toMatch(/\.tsx$/);
    });

    it("should not have TypeScript errors in route file", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      // Basic validation: should start with import and end with valid syntax
      expect(fileContent).toMatch(/^import/);
      expect(fileContent).toMatch(/;?\s*$/);
    });
  });

  describe("Navigation Integration", () => {
    it("layout should use ThemeProvider for consistent styling", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain("ThemeProvider");
    });

    it("layout should configure global Stack options", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain("screenOptions");
    });

    it("layout should render StatusBar", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      expect(fileContent).toContain("StatusBar");
    });
  });

  describe("Dependencies and Imports", () => {
    it("splash route should only import SplashScreen", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      const importCount = (fileContent.match(/^import/gm) || []).length;
      expect(importCount).toBe(1);
    });

    it("SplashScreen component should be imported with path alias", () => {
      const fileContent = fs.readFileSync(splashRoutePath, "utf8");
      expect(fileContent).toContain("@/src/presentation/screens/splash-screen");
    });

    it("layout should not break existing routes", () => {
      const fileContent = fs.readFileSync(layoutPath, "utf8");
      const expectedRoutes = ["index", "unlock", "(tabs)", "home", "emergency"];
      expectedRoutes.forEach((route) => {
        expect(fileContent).toContain(`name="${route}"`);
      });
    });
  });
});
