import { PinSetupScreen } from '@presentation/screens/pin-setup-screen';
import { UnlockWalletScreen } from '@presentation/screens/unlock-wallet-screen';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PinRepositoryImpl } from '@data/repositories/pin.repository.impl';
import { CheckPinExistsUseCase } from '@domain/use-cases/check-pin-exists.use-case';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPinSaved, setHasPinSaved] = useState(false);

  useEffect(() => {
    checkPinExists();
  }, []);

  const checkPinExists = async () => {
    try {
      const repository = new PinRepositoryImpl();
      const checkPinExistsUseCase = new CheckPinExistsUseCase(repository);
      
      const exists = await checkPinExistsUseCase.execute();
      setHasPinSaved(exists);
    } catch (error) {
      console.error('Error checking PIN existence:', error);
      setHasPinSaved(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return hasPinSaved ? <UnlockWalletScreen /> : <PinSetupScreen />;
}
