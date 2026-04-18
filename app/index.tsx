import { SplashScreen } from "@presentation/screens/splash-screen";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { PinResponsibilityRepositoryImpl } from "@data/repositories/pin-responsibility.repository.impl";
import { CheckPinExistsUseCase } from "@domain/use-cases/check-pin-exists.use-case";
import { CheckPinResponsibilityUseCase } from "@domain/use-cases/check-pin-responsibility.use-case";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

type InitialRoute = "/unlock" | "/pin-setup" | "/pin-responsibility";

export default function IndexScreen() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);
  const [nextRoute, setNextRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    const resolveRoute = async (): Promise<InitialRoute> => {
      try {
        const pinRepo = new PinRepositoryImpl();
        const hasPin = await new CheckPinExistsUseCase(pinRepo).execute();
        if (hasPin) {
          return "/unlock";
        }
        const responsibilityRepo = new PinResponsibilityRepositoryImpl();
        const accepted = await new CheckPinResponsibilityUseCase(
          responsibilityRepo,
        ).execute();
        return accepted ? "/pin-setup" : "/pin-responsibility";
      } catch {
        return "/pin-responsibility";
      }
    };

    resolveRoute().then(setNextRoute);

    const timer = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (splashDone && nextRoute) {
      router.replace(nextRoute);
    }
  }, [splashDone, nextRoute, router]);

  return <SplashScreen />;
}
