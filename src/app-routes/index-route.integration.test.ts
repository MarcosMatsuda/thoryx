/**
 * Integration test for app/index.tsx route
 * Validates that the index route correctly renders SplashScreen inline and navigates after pin check
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
      expect(fileContent).toContain("from 'react'");
    });

    it("should import useRouter from expo-router", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useRouter");
      expect(fileContent).toContain("from 'expo-router'");
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

    it("should define splashDone and hasPinSaved state variables", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "const [splashDone, setSplashDone] = useState(false)",
      );
      expect(fileContent).toContain(
        "const [hasPinSaved, setHasPinSaved] = useState<boolean | null>(null)",
      );
    });
  });

  describe("Pin Check Behavior", () => {
    it("should check for PIN existence in useEffect", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("const checkPin = async () => {");
      expect(fileContent).toContain(
        "const repository = new PinRepositoryImpl()",
      );
      expect(fileContent).toContain(
        "const useCase = new CheckPinExistsUseCase(repository)",
      );
      expect(fileContent).toContain("const exists = await useCase.execute()");
      expect(fileContent).toContain("setHasPinSaved(exists)");
    });

    it("should handle errors in pin check", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("} catch {");
      expect(fileContent).toContain("setHasPinSaved(false)");
    });

    it("should set splashDone after 2 seconds", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "setTimeout(() => setSplashDone(true), 2000)",
      );
    });
  });

  describe("Navigation Behavior", () => {
    it("should navigate to /unlock if PIN exists", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "router.replace(hasPinSaved ? '/unlock' : '/pin-setup')",
      );
      expect(fileContent).toContain("'/unlock'");
    });

    it("should navigate to /pin-setup if PIN does not exist", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain(
        "router.replace(hasPinSaved ? '/unlock' : '/pin-setup')",
      );
      expect(fileContent).toContain("'/pin-setup'");
    });

    it("should navigate only when splashDone and hasPinSaved are set", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("if (splashDone && hasPinSaved !== null)");
    });

    it("should use router.replace to reset navigation stack", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("router.replace");
      expect(fileContent).not.toContain("router.push");
    });

    it("should return SplashScreen component", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("return <SplashScreen />");
    });
  });

  describe("useEffect Setup", () => {
    it("should have useEffect for pin check and timer", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useEffect(() => {");
      expect(fileContent).toContain("checkPin()");
      expect(fileContent).toContain(
        "const timer = setTimeout(() => setSplashDone(true), 2000)",
      );
      expect(fileContent).toContain("return () => clearTimeout(timer)");
      expect(fileContent).toContain("}, [])");
    });

    it("should have useEffect for navigation with correct dependencies", () => {
      const fileContent = fs.readFileSync(indexRoutePath, "utf8");
      expect(fileContent).toContain("useEffect(() => {");
      expect(fileContent).toContain("}, [splashDone, hasPinSaved, router])");
    });
  });
});
