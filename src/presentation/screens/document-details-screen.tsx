import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentPhotoCarousel } from '@presentation/components/document-photo-carousel';
import { DetailRow } from '@presentation/components/detail-row';
import { ActionButtonLarge } from '@presentation/components/action-button-large';
import { InfoBanner } from '@presentation/components/info-banner';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { DocumentRepositoryImpl } from '@data/repositories/document.repository.impl';
import { Document } from '@domain/entities/document.entity';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@presentation/types/navigation';

export function DocumentDetailsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { documentId } = route.params as { documentId?: string };
  
  const [document, setDocument] = useState<Document | null>(null);
  const [frontPhotoUri, setFrontPhotoUri] = useState<string | null>(null);
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      setIsLoading(false);
    }
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) return;

    try {
      setIsLoading(true);
      const repository = new DocumentRepositoryImpl();
      const doc = await repository.findById(documentId);
      
      if (doc) {
        setDocument(doc);
        const frontUri = await repository.decryptPhoto(doc.frontPhotoEncrypted);
        const backUri = await repository.decryptPhoto(doc.backPhotoEncrypted);
        setFrontPhotoUri(frontUri);
        setBackPhotoUri(backUri);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'CNH':
        return "Driver's License";
      case 'RG':
        return 'National ID';
      default:
        return 'Document';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-text-secondary">Document not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {getDocumentTitle(document.type)}
          </Text>
          <Pressable 
            className="w-10 h-10 items-center justify-center"
            onPress={() => navigation.navigate('add-document', { documentId: document.id })}
          >
            <Text className="text-xl text-primary-main">✏️</Text>
          </Pressable>
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {frontPhotoUri && backPhotoUri && (
              <DocumentPhotoCarousel 
                frontPhotoUri={frontPhotoUri}
                backPhotoUri={backPhotoUri}
              />
            )}

            <View className="px-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-text-primary">
                  Document Details
                </Text>
              </View>

              <View className="bg-background-secondary rounded-2xl px-4">
                <DetailRow 
                  label="Full Name" 
                  value={document.fullName} 
                />
                <DetailRow 
                  label="Document Number" 
                  value={document.documentNumber} 
                />
                <DetailRow 
                  label="Date of Birth" 
                  value={document.dateOfBirth} 
                />
                <View className="flex-row justify-between items-center py-4">
                  <Text className="text-sm text-text-secondary">Expiry Date</Text>
                  <Text className="text-base font-semibold text-text-primary">{document.expiryDate}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="px-6">

          <View className="gap-3 mb-6">
            <ActionButtonLarge
              icon="🔗"
              label="Share Securely"
              variant="primary"
            />
            <ActionButtonLarge
              icon="📱"
              label="Show QR Code"
              variant="secondary"
            />
          </View>

            <InfoBanner
              icon="🔒"
              message="This document is encrypted and stored locally on your device. Sharing creates a temporary time-limited link."
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
