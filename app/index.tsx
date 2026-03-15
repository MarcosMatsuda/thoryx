import { SplashScreen } from "@presentation/screens/splash-screen";
import { PinRepositoryImpl } from "@data/repositories/pin.repository.impl";
import { CheckPinExistsUseCase } from "@domain/use-cases/check-pin-exists.use-case";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function IndexScreen() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);
  const [hasPinSaved, setHasPinSaved] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPin = async () => {
      try {
        const repository = new PinRepositoryImpl();
        const useCase = new CheckPinExistsUseCase(repository);
        const exists = await useCase.execute();
        setHasPinSaved(exists);
      } catch {
        setHasPinSaved(false);
      }
    };

    checkPin();

    const timer = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (splashDone && hasPinSaved !== null) {
      router.replace(hasPinSaved ? "/unlock" : "/pin-setup");
    }
  }, [splashDone, hasPinSaved, router]);

  return <SplashScreen />;
}
