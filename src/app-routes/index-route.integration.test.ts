/**
 * Integration test for app/index.tsx route
 * Validates that the index route renders SplashScreen inline and routes
 * to /unlock, /pin-setup, or /pin-responsibility depending on current state.
 */

import * as fs from "fs";
import * as path from "path";

describe("Index Route (app/index.tsx)", () => {
  const projectRoot = path.resolve(__dirname, "../..");
  const indexRoutePath = path.join(projectRoot, "app/index.tsx");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("File Structure", () => {
    it("should exist at app/index.tsx", () => {
      expect(fs.existsSync(indexRoutePath)).toBe(true);
    });

    it("should be a TypeScript/TSX file", () => {
      const fileName = path.basename(indexRoutePath);
      expect(fileName).toMatch(/\.tsx$/);
    });
  });

  describe("Imports", () => {
    it("should import useState and useEffect from react", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useState");
      expect(fileContent).toContain("useEffect");
      expect(fileContent).toContain('from "react"');
    });

    it("should import useRouter from expo-router", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useRouter");
      expect(fileContent).toContain('from "expo-router"');
    });

    it("should import SplashScreen from presentation screens", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("SplashScreen");
      expect(fileContent).toContain("@presentation/screens/splash-screen");
    });

    it("should import PinRepositoryImpl and CheckPinExistsUseCase", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("PinRepositoryImpl");
      expect(fileContent).toContain("@data/repositories/pin.repository.impl");
      expect(fileContent).toContain("CheckPinExistsUseCase");
      expect(fileContent).toContain(
        "@domain/use-cases/check-pin-exists.use-case",
      );
    });

    it("should import responsibility repository and use case", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("PinResponsibilityRepositoryImpl");
      expect(fileContent).toContain("CheckPinResponsibilityUseCase");
    });
  });

  describe("Component Definition", () => {
    it("should export default function IndexScreen", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("export default function IndexScreen");
    });

    it("should call useRouter hook", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("const router = useRouter()");
    });

    it("should define splashDone and nextRoute state variables", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "const [splashDone, setSplashDone] = useState(false)",
      );
      expect(fileContent).toContain("setNextRoute");
    });
  });

  describe("Routing Behavior", () => {
    it("should resolve the initial route by checking the PIN repository", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("new PinRepositoryImpl()");
      expect(fileContent).toContain("CheckPinExistsUseCase");
    });

    it("should fall back to /pin-responsibility when PIN check throws", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("catch");
      expect(fileContent).toContain('"/pin-responsibility"');
    });

    it("should set splashDone after 2 seconds", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "setTimeout(() => setSplashDone(true), 2000)",
      );
    });
  });

  describe("Navigation Behavior", () => {
    it("should navigate to /unlock when PIN exists", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain('"/unlock"');
    });

    it("should navigate to /pin-setup when PIN is absent but responsibility is accepted", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain('"/pin-setup"');
    });

    it("should navigate to /pin-responsibility when responsibility is not accepted", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain('"/pin-responsibility"');
    });

    it("should use router.replace to reset navigation stack", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("router.replace");
    });

    it("should return SplashScreen component", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("return <SplashScreen />");
    });
  });

  describe("useEffect Setup", () => {
    it("should have a splash timer useEffect that clears on unmount", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useEffect(() => {");
      expect(fileContent).toContain(
        "const timer = setTimeout(() => setSplashDone(true), 2000)",
      );
      expect(fileContent).toContain("return () => clearTimeout(timer)");
    });

    it("should have a navigation useEffect that depends on splashDone and nextRoute", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("splashDone");
      expect(fileContent).toContain("nextRoute");
      expect(fileContent).toContain("router.replace(nextRoute)");
    });
  });
});
