import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DropdownInput } from '@presentation/components/dropdown-input';
import { TextInputField } from '@presentation/components/text-input-field';
import { DateInput } from '@presentation/components/date-input';
import { PhotoUpload } from '@presentation/components/photo-upload';
import { CalendarPickerBottomSheet } from '@presentation/components/calendar-picker-bottom-sheet';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { DocumentRepositoryImpl } from '@data/repositories/document.repository.impl';
import { SaveDocumentUseCase } from '@domain/use-cases/save-document.use-case';
import { DeleteDocumentUseCase } from '@domain/use-cases/delete-document.use-case';
import { DocumentType } from '@domain/entities/document.entity';

const DOCUMENT_TYPES = [
  { label: 'CNH (Driver\'s License)', value: 'CNH' as DocumentType },
  { label: 'RG (National ID)', value: 'RG' as DocumentType }
];

export function AddDocumentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { documentId } = route.params as { documentId?: string } || {};
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarField, setCalendarField] = useState<'dateOfBirth' | 'expiryDate'>('expiryDate');
  
  const [documentType, setDocumentType] = useState<DocumentType>('CNH');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [dateOfBirthText, setDateOfBirthText] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [expiryDateText, setExpiryDateText] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) return;

    try {
      setIsLoading(true);
      const repository = new DocumentRepositoryImpl();
      const doc = await repository.findById(documentId);
      
      if (doc) {
        setDocumentType(doc.type);
        setDocumentNumber(doc.documentNumber);
        setFullName(doc.fullName);
        
        // Parse dates from DD/MM/YYYY format
        const parseDateFromString = (dateStr: string): Date | null => {
          const [day, month, year] = dateStr.split('/');
          if (day && month && year) {
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          return null;
        };
        
        const birthDate = parseDateFromString(doc.dateOfBirth);
        const expDate = parseDateFromString(doc.expiryDate);
        
        if (birthDate) {
          setDateOfBirth(birthDate);
          setDateOfBirthText(doc.dateOfBirth);
        }
        
        if (expDate) {
          setExpiryDate(expDate);
          setExpiryDateText(doc.expiryDate);
        }
        
        const frontUri = await repository.decryptPhoto(doc.frontPhotoEncrypted);
        const backUri = await repository.decryptPhoto(doc.backPhotoEncrypted);
        setFrontPhoto(frontUri);
        setBackPhoto(backUri);
        
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (calendarField === 'dateOfBirth') {
      setDateOfBirth(date);
      setDateOfBirthText(formatDate(date));
    } else {
      setExpiryDate(date);
      setExpiryDateText(formatDate(date));
    }
  };

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.substring(0, 8);
    
    if (limited.length >= 4) {
      return `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
    } else if (limited.length >= 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }
    return limited;
  };

  const handleDateOfBirthChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateOfBirthText(formatted);
    
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setDateOfBirth(date);
      }
    }
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setExpiryDateText(formatted);
    
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setExpiryDate(date);
      }
    }
  };

  const openCalendar = (field: 'dateOfBirth' | 'expiryDate') => {
    setCalendarField(field);
    setShowCalendar(true);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async (side: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (side === 'front') {
          setFrontPhoto(result.assets[0].uri);
        } else {
          setBackPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentId) return;

    setIsLoading(true);

    try {
      const repository = new DocumentRepositoryImpl();
      const deleteDocumentUseCase = new DeleteDocumentUseCase(repository);
      
      const result = await deleteDocumentUseCase.execute(documentId);

      if (result.success) {
        navigation.navigate('home' as never);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!documentNumber || !fullName || !dateOfBirth || !expiryDate || !frontPhoto || !backPhoto) {
      Alert.alert('Error', 'Please fill in all fields and take both photos');
      return;
    }

    setIsLoading(true);

    try {
      const repository = new DocumentRepositoryImpl();
      const saveDocumentUseCase = new SaveDocumentUseCase(repository);

      const result = await saveDocumentUseCase.execute({
        type: documentType,
        documentNumber,
        fullName,
        dateOfBirth: formatDate(dateOfBirth),
        expiryDate: formatDate(expiryDate),
        frontPhoto,
        backPhoto
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Document saved securely',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('home' as never)
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save document');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-2xl text-text-primary">←</Text>
          </Pressable>
          <Text className="text-lg font-bold text-text-primary">
            {isEditMode ? 'Edit Document' : 'Add Document'}
          </Text>
          {isEditMode && documentId ? (
            <Pressable
              className="w-10 h-10 items-center justify-center active:opacity-60"
              onPress={handleDeleteDocument}
              disabled={isLoading}
            >
              <Text className="text-xl text-status-error">🗑️</Text>
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 py-6"
        >
          <DropdownInput
            label="Document Type"
            placeholder="Select type"
            value={documentType}
            options={DOCUMENT_TYPES}
            onSelect={(value) => setDocumentType(value as DocumentType)}
          />

          <TextInputField
            label="Full Name"
            placeholder="e.g. Jonathan Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInputField
            label="Document Number"
            placeholder={documentType === 'CNH' ? 'e.g. 12345678900' : 'e.g. 123456789'}
            value={documentNumber}
            onChangeText={setDocumentNumber}
          />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <DateInput
                label="Date of Birth"
                placeholder="DD/MM/YYYY"
                value={dateOfBirthText}
                onChangeText={handleDateOfBirthChange}
                onPress={() => openCalendar('dateOfBirth')}
              />
            </View>
            <View className="flex-1">
              <DateInput
                label="Expiry Date"
                placeholder="DD/MM/YYYY"
                value={expiryDateText}
                onChangeText={handleExpiryDateChange}
                onPress={() => openCalendar('expiryDate')}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs font-semibold text-text-secondary tracking-wider mb-4">
              DOCUMENT PHOTOS
            </Text>

            <PhotoUpload
              title="Front Side"
              subtitle="Tap to take a photo"
              imageUri={frontPhoto}
              onPress={() => handleTakePhoto('front')}
            />

            <PhotoUpload
              title="Back Side"
              subtitle="Tap to take a photo"
              imageUri={backPhoto}
              onPress={() => handleTakePhoto('back')}
            />
          </View>

          <View className="flex-row bg-primary-main/10 rounded-xl p-4 mb-6">
            <View className="mr-3">
              <View className="w-6 h-6 bg-primary-main rounded-full items-center justify-center">
                <Text className="text-xs text-text-primary">🔒</Text>
              </View>
            </View>
            <Text className="flex-1 text-sm text-text-secondary leading-5">
              Your document is encrypted and stored locally on your device. Only you can access this information.
            </Text>
          </View>

          <Pressable 
            className={`rounded-xl py-4 items-center ${
              isLoading ? 'bg-primary-main/50 opacity-50' : 'bg-primary-main active:bg-primary-dark'
            }`}
            onPress={handleSaveDocument}
            disabled={isLoading}
          >
            <Text className="text-base font-bold text-text-primary">
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Document' : 'Save Document')}
            </Text>
          </Pressable>
        </ScrollView>

        <CalendarPickerBottomSheet
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onSelectDate={handleDateSelect}
          selectedDate={
            calendarField === 'dateOfBirth' ? dateOfBirth || undefined :
            expiryDate || undefined
          }
        />
      </View>
    </SafeAreaView>
  );
}
