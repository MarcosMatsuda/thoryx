import { useState, useEffect } from 'react';
import { BiometryService } from '@infrastructure/biometry/biometry.service';
import { AuthenticateWithBiometryUseCase } from '@domain/use-cases/authenticate-with-biometry.use-case';

export function useBiometry() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<'fingerprint' | 'facial' | 'iris' | 'none'>('none');
  const [isChecking, setIsChecking] = useState(true);

  const authenticateUseCase = new AuthenticateWithBiometryUseCase();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      setIsChecking(true);
      const available = await BiometryService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const type = await BiometryService.getBiometryType();
        setBiometryType(type);
      }
    } catch (error) {
      console.error('Error checking biometry:', error);
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const authenticate = async (promptMessage?: string) => {
    return await authenticateUseCase.execute(promptMessage);
  };

  const getBiometryName = () => {
    return BiometryService.getBiometryName(biometryType);
  };

  return {
    isAvailable,
    biometryType,
    isChecking,
    authenticate,
    getBiometryName,
    checkAvailability
  };
}
