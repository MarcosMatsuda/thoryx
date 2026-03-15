import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectableDocumentItem } from "@presentation/components/selectable-document-item";
import { useRouter } from "expo-router";
import { useState } from "react";

export function SelectDocumentsScreen() {
  const router = useRouter();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    "passport",
    "national-id",
  ]);

  const toggleDocument = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-ui-border">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl text-text-primary">✕</Text>
          </Pressable>
          <Text className="text-lg md:text-xl font-bold text-text-primary">
            Select Documents
          </Text>
          <Pressable>
            <Text className="text-base md:text-lg font-semibold text-primary-main">
              Help
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <Text className="text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
              Which documents do you want to share?
            </Text>
            <Text className="text-sm md:text-base text-text-secondary mb-6 leading-5">
              The app will enter a restricted &quot;Secure Mode&quot; showing
              only your selected documents for verification.
            </Text>

            <View className="mb-6">
              <SelectableDocumentItem
                icon="📖"
                title="Passport"
                subtitle="United States • **** 4589"
                selected={selectedDocs.includes("passport")}
                onToggle={() => toggleDocument("passport")}
              />
              <SelectableDocumentItem
                icon="🆔"
                title="National Identity Card"
                subtitle="Expires: 12/2028"
                selected={selectedDocs.includes("national-id")}
                onToggle={() => toggleDocument("national-id")}
              />
              <SelectableDocumentItem
                icon="🏥"
                title="Health Insurance Card"
                subtitle="Provider: BlueShield Premium"
                selected={selectedDocs.includes("health-insurance")}
                onToggle={() => toggleDocument("health-insurance")}
              />
              <SelectableDocumentItem
                icon="🛡️"
                title="Travel Insurance"
                subtitle="Policy No: TRV-99201-B"
                selected={selectedDocs.includes("travel-insurance")}
                onToggle={() => toggleDocument("travel-insurance")}
              />
            </View>

            <View className="bg-primary-main/10 rounded-2xl p-4 md:p-5 mb-6 border border-primary-main/20">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">🔒</Text>
                <View className="flex-1">
                  <Text className="text-sm md:text-base font-bold text-text-primary mb-2">
                    Secure Lock Mode:
                  </Text>
                  <Text className="text-xs md:text-sm text-text-secondary leading-5">
                    Once confirmed, your device will be locked to this screen.
                    Biometric authentication will be required to exit and access
                    the rest of your app.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-background-secondary rounded-2xl p-4 md:p-5 mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl md:text-2xl mr-2">🛡️</Text>
                <Text className="text-base md:text-lg font-semibold text-text-primary">
                  You are sharing{" "}
                  <Text className="text-primary-main">
                    {selectedDocs.length}
                  </Text>{" "}
                  documents
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-4 bg-background-primary border-t border-ui-border">
          <Pressable
            className="bg-primary-main rounded-xl py-4 items-center active:opacity-90"
            onPress={() => {
              router.back();
            }}
          >
            <Text className="text-base md:text-lg font-bold text-text-primary">
              Confirm & Lock App
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
