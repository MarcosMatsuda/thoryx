import { CameraScannerV2 } from "@presentation/components/camera-scanner-v2";
import { CheckboxOption } from "@presentation/components/checkbox-option";
import { CreditCardCarousel } from "@presentation/components/credit-card-carousel";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreditCardRepositoryImpl } from "@data/repositories/credit-card.repository.impl";
import { SaveCreditCardUseCase } from "@domain/use-cases/save-credit-card.use-case";
import { UpdateCreditCardUseCase } from "@domain/use-cases/update-credit-card.use-case";
import { DeleteCreditCardUseCase } from "@domain/use-cases/delete-credit-card.use-case";
import { useCreditCards } from "@presentation/hooks/use-credit-cards";
import { InputMasks } from "@shared/utils/input-masks";

export function AddCreditCardScreen() {
  const router = useRouter();
  const { cards, isLoading: isLoadingCards } = useCreditCards();
  const [saveCard, setSaveCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [originalCardData, setOriginalCardData] = useState<{
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
  } | null>(null);

  useEffect(() => {
    if (cards.length > 0 && !cardNumber) {
      loadCard(cards[0], 0);
    }
  }, [cards]);

  const loadCard = (card: any, index: number) => {
    const maskedNumber = `**** **** **** ${card.lastFourDigits}`;
    setCardholderName(card.cardholderName);
    setExpiryDate(card.expiryDate);
    setCardNumber(maskedNumber);
    setIsEditMode(true);
    setEditingCardId(card.id);
    setSelectedCardIndex(index);
    setOriginalCardData({
      cardNumber: maskedNumber,
      cardholderName: card.cardholderName,
      expiryDate: card.expiryDate
    });
  };

  const hasChanges = () => {
    if (!isEditMode || !originalCardData) return true;
    
    return (
      cardNumber !== originalCardData.cardNumber ||
      cardholderName !== originalCardData.cardholderName ||
      expiryDate !== originalCardData.expiryDate
    );
  };

  const handleCardDataExtracted = (data: {
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
  }) => {
    if (data.cardNumber) setCardNumber(InputMasks.creditCardNumber(data.cardNumber));
    if (data.cardholderName) setCardholderName(InputMasks.cardholderName(data.cardholderName));
    if (data.expiryDate) setExpiryDate(InputMasks.expiryDate(data.expiryDate));
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(InputMasks.creditCardNumber(text));
  };

  const handleCardholderNameChange = (text: string) => {
    setCardholderName(InputMasks.cardholderName(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(InputMasks.expiryDate(text));
  };

  const handleSaveCard = async () => {
    if (!cardholderName || !expiryDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const repository = new CreditCardRepositoryImpl();

      if (isEditMode && editingCardId) {
        const updateCardUseCase = new UpdateCreditCardUseCase(repository);
        
        const result = await updateCardUseCase.execute({
          cardId: editingCardId,
          cardholderName,
          expiryDate: InputMasks.removeExpiryDateMask(expiryDate)
        });

        if (result.success) {
          Alert.alert(
            'Success',
            'Credit card updated successfully',
            [
              {
                text: 'OK',
                onPress: () => router.push('/home')
              }
            ]
          );
        } else {
          Alert.alert('Error', result.message);
        }
      } else {
        if (!cardNumber) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }

        const saveCardUseCase = new SaveCreditCardUseCase(repository);
        
        const result = await saveCardUseCase.execute({
          cardNumber: InputMasks.removeCardNumberMask(cardNumber),
          cardholderName,
          expiryDate: InputMasks.removeExpiryDateMask(expiryDate)
        });

        if (result.success) {
          Alert.alert(
            'Success',
            'Credit card saved securely',
            [
              {
                text: 'OK',
                onPress: () => router.push('/home')
              }
            ]
          );
        } else {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save credit card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewCard = () => {
    setCardNumber("");
    setCardholderName("");
    setExpiryDate("");
    setIsEditMode(false);
    setEditingCardId(null);
    setOriginalCardData(null);
    setSelectedCardIndex(-1);
  };

  const handleCardSelect = (card: any, index: number) => {
    loadCard(card, index);
  };

  const handleDeleteCard = async () => {
    if (!editingCardId) return;

    setIsLoading(true);

    try {
      const repository = new CreditCardRepositoryImpl();
      const deleteCardUseCase = new DeleteCreditCardUseCase(repository);
      
      const result = await deleteCardUseCase.execute(editingCardId);

      if (result.success) {
        handleAddNewCard();
        router.push('/home');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete credit card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            {cards.length > 0 && isEditMode ? 'Credit Card' : 'New Credit Card'}
          </Text>
          {cards.length > 0 && isEditMode ? (
            <Pressable
              className="w-10 h-10 items-center justify-center"
              onPress={handleAddNewCard}
            >
              <Text className="text-2xl text-primary-main">+</Text>
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {cards.length > 0 && isEditMode ? (
              <CreditCardCarousel
                cards={cards}
                onCardSelect={handleCardSelect}
                selectedIndex={selectedCardIndex}
              />
            ) : (
              <CameraScannerV2 
                onCardDataExtracted={handleCardDataExtracted}
                cardNumber={cardNumber}
                cardholderName={cardholderName}
                expiryDate={expiryDate}
              />
            )}

              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-text-primary">
                    Card Details
                  </Text>
                  {isEditMode && editingCardId && (
                    <Pressable
                      className="w-10 h-10 items-center justify-center active:opacity-60"
                      onPress={handleDeleteCard}
                      disabled={isLoading}
                    >
                      <Text className="text-xl text-status-error">🗑️</Text>
                    </Pressable>
                  )}
                </View>
                {!isEditMode && (
                  <Text className="text-sm text-text-secondary mb-4">
                    Fields will be automatically filled after scanning
                  </Text>
                )}

                <View className="mb-4">
                  <Text className="text-sm text-text-secondary mb-2">
                    Cardholder Name
                  </Text>
                <View className="bg-background-secondary rounded-xl px-4 py-4 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text-primary"
                    placeholder="e.g. JONATHAN DOE"
                    placeholderTextColor="#64748B"
                    value={cardholderName}
                    onChangeText={handleCardholderNameChange}
                    autoCapitalize="characters"
                  />
                  <Text className="text-xl text-primary-main ml-2">👤</Text>
                </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-text-secondary mb-2">
                    Card Number
                  </Text>
                <View className="bg-background-secondary rounded-xl px-4 py-4 flex-row items-center">
                  <TextInput
                    className="flex-1 text-text-primary"
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    maxLength={19}
                  />
                  <Text className="text-xl text-primary-main ml-2">💳</Text>
                </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-text-secondary mb-2">
                    Expiry Date
                  </Text>
                  <TextInput
                    className="bg-background-secondary rounded-xl px-4 py-4 text-text-primary"
                    placeholder="MM/YY"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={expiryDate}
                    onChangeText={handleExpiryDateChange}
                    maxLength={5}
                  />
                </View>

                <CheckboxOption
                  label="keep as primary card"
                  checked={saveCard}
                  onToggle={() => setSaveCard(!saveCard)}
                />
              </View>

            <Pressable
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                isLoading || (isEditMode && !hasChanges()) 
                  ? 'bg-primary-main/50 opacity-50' 
                  : 'bg-primary-main active:bg-primary-dark'
              }`}
              onPress={handleSaveCard}
              disabled={isLoading || (isEditMode && !hasChanges())}
            >
              <Text className="text-lg mr-2">🔒</Text>
              <Text className="text-base font-bold text-text-primary">
                {isLoading ? 'Saving...' : (isEditMode ? 'Update Card' : 'Securely Add Card')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
