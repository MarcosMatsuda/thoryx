import { ActionCard } from "@presentation/components/action-card";
import { useCreditCards } from "@presentation/hooks/use-credit-cards";
import { useDocuments } from "@presentation/hooks/use-documents";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgIcon } from "@presentation/components/svg-icon";
import { RootStackParamList } from "@presentation/types/navigation";

export function WalletHomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { documents } = useDocuments();
  const { cards } = useCreditCards();

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "CNH":
        return "🚗";
      case "RG":
        return "🆔";
      default:
        return "📄";
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case "CNH":
        return "Driver's License";
      case "RG":
        return "National ID";
      default:
        return "Document";
    }
  };

  const getCardLabel = () => {
    if (cards.length === 0) {
      return "New Card";
    } else if (cards.length === 1) {
      return "Card";
    } else {
      return "Cards";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden mr-3">
                <View className="w-full h-full bg-primary-main/20 items-center justify-center">
                  <Text className="text-xl md:text-2xl text-text-primary">
                    👤
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-xs md:text-sm text-text-secondary mb-1">
                  Welcome back,
                </Text>
                <Text className="text-lg md:text-xl font-bold text-text-primary">
                  Alex Rivera
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-xs md:text-sm font-semibold text-text-secondary mb-3 tracking-wider">
              QUICK ACTIONS
            </Text>
            <View className="flex-row gap-3 md:gap-4 justify-between md:justify-start">
              <ActionCard
                icon={<SvgIcon name="new-card" width={28} height={28} />}
                label={getCardLabel()}
                variant="primary"
                onPress={() => navigation.navigate("add-credit-card" as never)}
              />
              <ActionCard
                icon={<SvgIcon name="triangle-allergies" width={28} height={28} />}
                label="Emergency"
                variant="danger"
                onPress={() => navigation.navigate("emergency" as never)}
              />
              <ActionCard
                icon={<SvgIcon name="add-doc" width={28} height={28} />}
                label="Add Doc"
                variant="secondary"
                onPress={() => navigation.navigate("add-document" as never)}
              />
            </View>
          </View>

          <View className="bg-primary-main rounded-2xl p-5 md:p-6 mb-6">
            <View className="flex-row items-center mb-3">
              <View className="mr-2">
                <SvgIcon name="verified-shield" width={24} height={24} />
              </View>
              <Text className="text-lg md:text-xl font-bold text-text-primary">
                Secure Sharing Mode
              </Text>
            </View>
            <Text className="text-sm md:text-base text-text-primary/80 mb-5 leading-5">
              Select documents to share for check-ins or verification. Others
              will be locked and hidden from view.
            </Text>
            <Pressable
              className="bg-white rounded-xl py-3.5 items-center active:opacity-90"
              onPress={() => navigation.navigate("select-documents" as never)}
            >
              <Text className="text-base md:text-lg font-bold text-primary-main">
                Start Sharing
              </Text>
            </Pressable>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs md:text-sm font-semibold text-text-secondary tracking-wider">
                MY DOCUMENTS
              </Text>
              <Pressable>
                <Text className="text-sm md:text-base font-semibold text-primary-main">
                  See All
                </Text>
              </Pressable>
            </View>

            <View className="gap-3">
              {documents.map((doc) => (
                <Pressable
                  key={doc.id}
                  className="bg-background-secondary rounded-2xl p-4 active:opacity-80"
                  onPress={() =>
                    navigation.navigate(
                      "document-details",
                      { documentId: doc.id }
                    )
                  }
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row flex-1">
                      <View className="w-12 h-12 md:w-14 md:h-14 bg-primary-main/10 rounded-xl items-center justify-center mr-3">
                        <Text className="text-2xl md:text-3xl">
                          {getDocumentIcon(doc.type)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base md:text-lg font-bold text-text-primary mb-1">
                          {getDocumentLabel(doc.type)}
                        </Text>
                        <Text className="text-sm md:text-base font-semibold text-text-primary mb-1">
                          {doc.fullName}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-xs md:text-sm text-text-secondary">
                            DOCUMENT NUMBER
                          </Text>
                        </View>
                        <Text className="text-sm md:text-base text-text-secondary">
                          •••• •••• {doc.documentNumber.slice(-4)}
                        </Text>
                      </View>
                    </View>
                    <View className="w-8 h-8 bg-primary-main/10 rounded-lg items-center justify-center ml-2">
                      <Text className="text-primary-main text-lg">📋</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="pb-6" />
        </View>
      </ScrollView>

      <View className="flex-row bg-background-secondary border-t border-ui-border">
        <Pressable className="flex-1 items-center py-3">
          <Text className="text-2xl mb-1">🏠</Text>
          <Text className="text-xs font-medium text-primary-main">Home</Text>
        </Pressable>
        <Pressable className="flex-1 items-center py-3">
          <Text className="text-2xl mb-1">🕐</Text>
          <Text className="text-xs font-medium text-text-secondary">
            History
          </Text>
        </Pressable>
        <Pressable className="flex-1 items-center py-3">
          <View className="w-14 h-14 bg-primary-main rounded-full items-center justify-center absolute -top-7">
            <Text className="text-3xl">📱</Text>
          </View>
        </Pressable>
        <Pressable className="flex-1 items-center py-3">
          <Text className="text-2xl mb-1">🛡️</Text>
          <Text className="text-xs font-medium text-text-secondary">
            Security
          </Text>
        </Pressable>
        <Pressable className="flex-1 items-center py-3">
          <Text className="text-2xl mb-1">⚙️</Text>
          <Text className="text-xs font-medium text-text-secondary">
            Settings
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
