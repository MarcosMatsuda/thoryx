/**
 * Unit tests for SplashScreen as a dumb component
 * After PR #62 fix, SplashScreen should be purely presentational
 */

import * as fs from "fs";

describe("SplashScreen as Dumb Component", () => {
  const componentPath = require("path").join(__dirname, "./splash-screen.tsx");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Structure", () => {
    it("should export a function named SplashScreen", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("export function SplashScreen");
    });

    it("should import View and Image from react-native", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("from 'react-native'");
      expect(fileContent).toContain("View");
      expect(fileContent).toContain("Image");
    });

    it("should import Animated from react-native-reanimated", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("from 'react-native-reanimated'");
      expect(fileContent).toContain("Animated");
    });
  });

  describe("Animation Logic", () => {
    it("should use useSharedValue for opacity", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("useSharedValue");
      expect(fileContent).toContain("opacity");
    });

    it("should start fade-in animation on mount", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("useEffect");
      expect(fileContent).toContain("opacity.value = withTiming");
    });

    it("should have 800ms animation duration", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("800");
    });

    it("should use Easing.out(Easing.cubic) for animation", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("Easing.out(Easing.cubic)");
    });

    it("should use useAnimatedStyle for animated styles", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("useAnimatedStyle");
    });
  });

  describe("No Navigation Logic", () => {
    it("should NOT import useRouter from expo-router", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("from 'expo-router'");
      expect(fileContent).not.toContain("useRouter");
    });

    it("should NOT import CheckPinExistsUseCase", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("CheckPinExistsUseCase");
    });

    it("should NOT import PinRepositoryImpl", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("PinRepositoryImpl");
    });

    it("should NOT have navigation routes (/unlock or /pin-setup)", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("/unlock");
      expect(fileContent).not.toContain("/pin-setup");
    });

    it("should NOT have router.replace or router.push", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("router.replace");
      expect(fileContent).not.toContain("router.push");
    });

    it("should NOT have PIN check logic", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("checkPinExists");
      expect(fileContent).not.toContain("hasPinChecked");
      expect(fileContent).not.toContain("hasPinSaved");
    });

    it("should NOT have error handling for PIN check", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("catch");
      expect(fileContent).not.toContain("console.error");
      expect(fileContent).not.toContain("setHasPinSaved(false)");
    });

    it("should NOT have 2-second timer for navigation", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).not.toContain("2000"); // Except possibly in comments
      // Check that 2000 is not in the main logic (outside of comments)
      const lines = fileContent.split("\n");
      const has2000InLogic = lines.some((line) => {
        const trimmed = line.trim();
        return trimmed.includes("2000") && !trimmed.startsWith("//");
      });
      expect(has2000InLogic).toBe(false);
    });
  });

  describe("Rendering", () => {
    it("should render a container with testID", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain('testID="splash-container"');
    });

    it("should render an Image with splash icon", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("Image");
      expect(fileContent).toContain("splash-icon.png");
    });

    it("should have testID on logo image", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain('testID="splash-logo"');
    });

    it("should have accessibility label on logo", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("accessibilityLabel");
      expect(fileContent).toContain("Thoryx Logo");
    });

    it("should use contain resize mode", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain('resizeMode="contain"');
    });

    it("should apply NativeWind classes", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("className=");
    });
  });

  describe("Clean Architecture", () => {
    it("should have only one useEffect for animation", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      // Count useEffect calls, not imports
      const effectCount = (fileContent.match(/useEffect\(/g) || []).length;
      expect(effectCount).toBe(1);
    });

    it("should have empty dependency array for useEffect", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      expect(fileContent).toContain("useEffect(() => {");
      expect(fileContent).toContain("}, [])");
    });

    it("should be a pure presentational component", () => {
      const fileContent = fs.readFileSync(componentPath, "utf8");
      // Should not have any business logic imports
      expect(fileContent).not.toContain("@domain");
      expect(fileContent).not.toContain("@data");
      expect(fileContent).not.toContain("use-case");
      expect(fileContent).not.toContain("repository");
    });
  });
});
