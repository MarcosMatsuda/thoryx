import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { DocumentRepositoryImpl } from "@data/repositories/document.repository.impl";
import { Document } from "@domain/entities/document.entity";
import { DocumentCard } from "@presentation/components/document-card";
import { CountdownTimer } from "@presentation/components/countdown-timer";
import { SecureStorageAdapter } from "@infrastructure/storage/secure-storage.adapter";

const AUTO_LOCK_TIMEOUT_KEY = "auto_lock_timeout_minutes";
const storage = new SecureStorageAdapter(
  "settings-storage",
  "thoryx-mmkv-encryption-key-2026",
);

export function GuestModeScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeoutMinutes, setTimeoutMinutes] = useState(5); // fallback de 5 minutos
  const [isLoading, setIsLoading] = useState(true);
  const documentRepository = new DocumentRepositoryImpl();

  useEffect(() => {
    loadTimeout();
    loadDocuments();
  }, []);

  const loadTimeout = async () => {
    try {
      const saved = await storage.get(AUTO_LOCK_TIMEOUT_KEY);
      if (saved) {
        const minutes = parseInt(saved, 10);
        if (!isNaN(minutes) && minutes > 0) {
          setTimeoutMinutes(minutes);
        }
      }
    } catch (error) {
      console.error("Error loading auto-lock timeout:", error);
      // Mantém o fallback de 5 minutos
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const allDocuments = await documentRepository.findAll();
      const autoLockDocuments = allDocuments.filter(
        (doc) => doc.isAutoLockEnabled === true,
      );
      setDocuments(autoLockDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentPress = (documentId: string) => {
    router.push(`/document-details?documentId=${documentId}&guestMode=true`);
  };

  const handleTimerExpire = () => {
    // Navega para a tela de unlock sem possibilidade de voltar
    router.replace("/unlock");
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-2xl font-bold text-center text-text-secondary mb-4">
        No documents shared
      </Text>
      <Text className="text-base text-center text-text-tertiary mb-8">
        The timer will still expire and redirect to the lock screen.
      </Text>
      <CountdownTimer
        durationMinutes={timeoutMinutes}
        onExpire={handleTimerExpire}
        style="prominent"
      />
    </View>
  );

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "RG":
        return "🆔";
      case "CNH":
        return "🚗";
      case "CreditCard":
        return "💳";
      default:
        return "📄";
    }
  };

  const formatDocumentSubtitle = (document: Document) => {
    return `${document.documentNumber} • Expires: ${document.expiryDate}`;
  };

  const renderDocumentList = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-4">
        {documents.map((document) => (
          <Pressable
            key={document.id}
            onPress={() => handleDocumentPress(document.id)}
            className="mb-4"
          >
            <DocumentCard
              type={document.type}
              title={document.fullName}
              subtitle={formatDocumentSubtitle(document)}
              icon={getDocumentIcon(document.type)}
              badge={document.isAutoLockEnabled ? "Auto-lock" : undefined}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-border-primary">
        <Text className="text-3xl font-bold text-text-primary mb-2">
          Shared Documents
        </Text>
        <Text className="text-base text-text-secondary mb-4">
          Access expires in
        </Text>
        <CountdownTimer
          durationMinutes={timeoutMinutes}
          onExpire={handleTimerExpire}
          style="prominent"
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-text-secondary">Loading...</Text>
        </View>
      ) : documents.length === 0 ? (
        renderEmptyState()
      ) : (
        renderDocumentList()
      )}
    </SafeAreaView>
  );
}
