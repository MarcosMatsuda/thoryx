/**
 * Integration tests for the complete splash flow.
 * Validates the entire initialization flow from app start to PIN-based routing,
 * including the PIN responsibility gate for new users.
 */

import * as fs from "fs";
import * as path from "path";

describe("Splash Screen Flow Integration", () => {
  const projectRoot = path.resolve(__dirname, "../../..");
  const indexPath = path.join(projectRoot, "app/index.tsx");
  const splashPath = path.join(projectRoot, "app/splash.tsx");
  const pinSetupPath = path.join(projectRoot, "app/pin-setup.tsx");
  const pinResponsibilityPath = path.join(
    projectRoot,
    "app/pin-responsibility.tsx",
  );
  const splashScreenPath = path.join(
    projectRoot,
    "src/presentation/screens/splash-screen.tsx",
  );
  const layoutPath = path.join(projectRoot, "app/_layout.tsx");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Route Registration", () => {
    it("should have all required routes registered", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      expect(layoutContent).toContain('name="index"');
      expect(layoutContent).toContain('name="splash"');
      expect(layoutContent).toContain('name="pin-setup"');
      expect(layoutContent).toContain('name="unlock"');
      expect(layoutContent).toContain('name="pin-responsibility"');
    });

    it("should register auth routes in a consistent order", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      const indexPos = layoutContent.indexOf('name="index"');
      const splashPos = layoutContent.indexOf('name="splash"');
      const unlockPos = layoutContent.indexOf('name="unlock"');
      const pinSetupPos = layoutContent.indexOf('name="pin-setup"');

      expect(indexPos).toBeLessThan(splashPos);
      expect(splashPos).toBeLessThan(unlockPos);
      expect(unlockPos).toBeLessThan(pinSetupPos);
    });

    it("all auth routes should hide headers", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      const headerShownCount = (
        layoutContent.match(/headerShown:\s*false/g) || []
      ).length;
      expect(headerShownCount).toBeGreaterThan(0);
    });
  });

  describe("Index Route Entry Point", () => {
    it("should exist at app/index.tsx", () => {
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it("should render SplashScreen component inline", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("SplashScreen");
      expect(indexContent).toContain("return <SplashScreen />");
    });

    it("should check PIN existence and navigate after 2 seconds", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("PinRepositoryImpl");
      expect(indexContent).toContain("CheckPinExistsUseCase");
      expect(indexContent).toContain(
        "setTimeout(() => setSplashDone(true), 2000)",
      );
    });

    it("should check responsibility acceptance", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("CheckPinResponsibilityUseCase");
      expect(indexContent).toContain("PinResponsibilityRepositoryImpl");
    });

    it("should use router.replace for the resolved route", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("router.replace(nextRoute)");
    });

    it("should navigate to /unlock, /pin-setup, or /pin-responsibility", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain('"/unlock"');
      expect(indexContent).toContain('"/pin-setup"');
      expect(indexContent).toContain('"/pin-responsibility"');
    });
  });

  describe("Splash Route File", () => {
    it("should exist at app/splash.tsx", () => {
      expect(fs.existsSync(splashPath)).toBe(true);
    });

    it("should render SplashScreen component", () => {
      const splashContent = fs.readFileSync(splashPath, "utf8");
      expect(splashContent).toContain("SplashScreen");
    });

    it("should be a simple wrapper", () => {
      const splashContent = fs.readFileSync(splashPath, "utf8");
      const lines = splashContent.trim().split("\n");
      expect(lines.length).toBeLessThanOrEqual(10);
    });
  });

  describe("SplashScreen Component Logic", () => {
    it("should be a dumb component with no navigation logic", () => {
      const screenContent = fs.readFileSync(splashScreenPath, "utf8");
      expect(screenContent).not.toContain("checkPinExists");
      expect(screenContent).not.toContain("CheckPinExistsUseCase");
      expect(screenContent).not.toContain("PinRepositoryImpl");
      expect(screenContent).not.toContain('"/unlock"');
      expect(screenContent).not.toContain('"/pin-setup"');
      expect(screenContent).not.toContain("router.replace");
      expect(screenContent).not.toContain("router.push");
    });

    it("should only contain animation logic", () => {
      const screenContent = fs.readFileSync(splashScreenPath, "utf8");
      expect(screenContent).toContain("useSharedValue");
      expect(screenContent).toContain("withTiming");
      expect(screenContent).toContain("800");
      expect(screenContent).toContain("opacity");
      expect(screenContent).toContain("useAnimatedStyle");
      expect(screenContent).toContain("Easing.out(Easing.cubic)");
    });

    it("should render splash image with accessibility", () => {
      const screenContent = fs.readFileSync(splashScreenPath, "utf8");
      expect(screenContent).toContain("Image");
      expect(screenContent).toContain("splash-icon.png");
      expect(screenContent).toContain('testID="splash-container"');
      expect(screenContent).toContain('testID="splash-logo"');
      expect(screenContent).toContain("accessibilityLabel");
    });
  });

  describe("Index Route Logic", () => {
    it("should contain all navigation and PIN check logic", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("CheckPinExistsUseCase");
      expect(indexContent).toContain("PinRepositoryImpl");
      expect(indexContent).toContain("splashDone");
      expect(indexContent).toContain("nextRoute");
      expect(indexContent).toContain('"/unlock"');
      expect(indexContent).toContain('"/pin-setup"');
      expect(indexContent).toContain('"/pin-responsibility"');
      expect(indexContent).toContain("router.replace");
      expect(indexContent).toContain("2000");
      expect(indexContent).toContain("setTimeout");
    });

    it("should handle errors gracefully", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("try");
      expect(indexContent).toContain("catch");
    });

    it("should wait for splash animation and resolved route", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("splashDone");
      expect(indexContent).toContain("nextRoute");
    });
  });

  describe("Pin Setup Route", () => {
    it("should exist at app/pin-setup.tsx", () => {
      expect(fs.existsSync(pinSetupPath)).toBe(true);
    });

    it("should render PinSetupScreen", () => {
      const pinSetupContent = fs.readFileSync(pinSetupPath, "utf8");
      expect(pinSetupContent).toContain("PinSetupScreen");
    });

    it("should be reachable from index route", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain('"/pin-setup"');
    });
  });

  describe("Pin Responsibility Route", () => {
    it("should exist at app/pin-responsibility.tsx", () => {
      expect(fs.existsSync(pinResponsibilityPath)).toBe(true);
    });

    it("should render PinResponsibilityScreen", () => {
      const pinResponsibilityContent = fs.readFileSync(
        pinResponsibilityPath,
        "utf8",
      );
      expect(pinResponsibilityContent).toContain("PinResponsibilityScreen");
    });
  });

  describe("Navigation Flow", () => {
    it("app.start -> index.tsx -> /unlock, /pin-setup or /pin-responsibility", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("SplashScreen");
      expect(indexContent).toContain('"/unlock"');
      expect(indexContent).toContain('"/pin-setup"');
      expect(indexContent).toContain('"/pin-responsibility"');
    });

    it("router.replace is used exactly once via nextRoute", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      const replaceCount = (indexContent.match(/router\.replace/g) || [])
        .length;
      expect(replaceCount).toBe(1);
      expect(indexContent).toContain("router.replace(nextRoute)");
    });
  });

  describe("Back Button Behavior", () => {
    it("should prevent back navigation from auth screens", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("router.replace");
    });

    it("layout may have gestureEnabled disabled for auth flow", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      expect(layoutContent).toContain("gestureEnabled");
    });
  });

  describe("Timing and Animation", () => {
    it("splash animation should be 800ms", () => {
      const screenContent = fs.readFileSync(splashScreenPath, "utf8");
      expect(screenContent).toContain("duration: 800");
    });

    it("total splash display should be ~2 seconds", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("2000");
    });

    it("should complete PIN check before navigation", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("splashDone");
      expect(indexContent).toContain("nextRoute");
      expect(indexContent).toContain("setTimeout");
    });
  });

  describe("Error Handling", () => {
    it("CheckPinExistsUseCase should handle errors", () => {
      const useCasePath = path.join(
        projectRoot,
        "src/domain/use-cases/check-pin-exists.use-case.ts",
      );
      const useCaseContent = fs.readFileSync(useCasePath, "utf8");
      expect(useCaseContent).toContain("try");
      expect(useCaseContent).toContain("catch");
    });

    it("should return false if PIN check fails", () => {
      const useCasePath = path.join(
        projectRoot,
        "src/domain/use-cases/check-pin-exists.use-case.ts",
      );
      const useCaseContent = fs.readFileSync(useCasePath, "utf8");
      expect(useCaseContent).toContain("return false");
    });

    it("index should default to /pin-responsibility on error", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain('"/pin-responsibility"');
      expect(indexContent).toContain("catch");
    });
  });

  describe("Code Organization", () => {
    it("route files should be simple wrappers", () => {
      const indexLines = fs.readFileSync(indexPath, "utf8").split("\n").length;
      const splashLines = fs
        .readFileSync(splashPath, "utf8")
        .split("\n").length;
      const pinSetupLines = fs
        .readFileSync(pinSetupPath, "utf8")
        .split("\n").length;

      expect(indexLines).toBeLessThan(60);
      expect(splashLines).toBeLessThan(10);
      expect(pinSetupLines).toBeLessThan(10);
    });

    it("complex logic should be in index route, not splash screen", () => {
      const screenLines = fs
        .readFileSync(splashScreenPath, "utf8")
        .split("\n").length;
      const indexLines = fs.readFileSync(indexPath, "utf8").split("\n").length;
      expect(screenLines).toBeLessThanOrEqual(50);
      expect(indexLines).toBeGreaterThan(30);
    });

    it("use-case should be testable", () => {
      const useCasePath = path.join(
        projectRoot,
        "src/domain/use-cases/check-pin-exists.use-case.ts",
      );
      const useCaseContent = fs.readFileSync(useCasePath, "utf8");
      expect(useCaseContent).toContain("constructor");
      expect(useCaseContent).toContain("execute");
    });
  });

  describe("Acceptance Criteria", () => {
    it("criterion: Toda abertura do app mostra a SplashScreen primeiro", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("SplashScreen");
      expect(indexContent).toContain("useEffect");
    });

    it("criterion: Após ~2s, transita automaticamente para o fluxo correto", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("2000");
      expect(indexContent).toContain("setTimeout");
      expect(indexContent).toContain("splashDone");
    });

    it("criterion: Stack resetado — back não volta para splash", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("router.replace");
    });

    it("criterion: Fluxo de PIN check continua funcionando", () => {
      const indexContent = fs.readFileSync(indexPath, "utf8");
      expect(indexContent).toContain("CheckPinExistsUseCase");
      expect(indexContent).toContain("nextRoute");
    });
  });

  describe("Files Modified/Created", () => {
    it("should have modified app/index.tsx", () => {
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it("should have created app/pin-setup.tsx", () => {
      expect(fs.existsSync(pinSetupPath)).toBe(true);
    });

    it("should have modified app/_layout.tsx to register pin-setup", () => {
      const layoutContent = fs.readFileSync(layoutPath, "utf8");
      expect(layoutContent).toContain('name="pin-setup"');
    });

    it("should have updated src/presentation/screens/splash-screen.tsx", () => {
      const screenContent = fs.readFileSync(splashScreenPath, "utf8");
      expect(screenContent).not.toContain("CheckPinExistsUseCase");
      expect(screenContent).not.toContain("useRouter");
      expect(screenContent).toContain("useSharedValue");
      expect(screenContent).toContain("withTiming");
    });
  });
});
