import { useState, useEffect, useCallback } from "react";
import { EmergencyInfo } from "@domain/entities/emergency-info.entity";
import { EmergencyInfoRepositoryImpl } from "@data/repositories/emergency-info.repository.impl";
import { GetEmergencyInfoUseCase } from "@domain/use-cases/get-emergency-info.use-case";

export function useEmergencyInfo() {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencyInfo();
  }, [loadEmergencyInfo]);

  const loadEmergencyInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const repository = new EmergencyInfoRepositoryImpl();
      const getEmergencyInfoUseCase = new GetEmergencyInfoUseCase(repository);

      const info = await getEmergencyInfoUseCase.execute();
      setEmergencyInfo(info);
    } catch (error) {
      console.error("Error loading emergency info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = loadEmergencyInfo;

  return {
    emergencyInfo,
    isLoading,
    refresh,
  };
}
