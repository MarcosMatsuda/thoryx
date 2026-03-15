import { Text, Pressable, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { ReactNode } from "react";

interface ActionCardProps {
  icon: string | ReactNode;
  label: string;
  onPress?: () => void;
  variant?: "primary" | "danger" | "secondary";
}

export function ActionCard({
  icon,
  label,
  onPress,
  variant = "primary",
}: ActionCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-background-secondary border border-ui-border";
      case "danger":
        return "bg-status-error/10 border border-status-error/30";
      case "secondary":
        return "bg-background-secondary border border-ui-border";
      default:
        return "bg-background-secondary border border-ui-border";
    }
  };

  const getCircleBackground = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-main";
      case "danger":
        return "bg-status-error";
      case "secondary":
        return "bg-primary-main";
      default:
        return "bg-primary-main";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "danger":
        return "text-status-error";
      default:
        return "text-text-primary";
    }
  };

  const renderIcon = () => {
    if (typeof icon === "string") {
      return <Text className="text-2xl md:text-3xl">{icon}</Text>;
    }
    return icon;
  };

  return (
    <Pressable
      className={`flex-1 max-w-[115px] md:max-w-[140px] rounded-2xl p-4 md:p-5 items-center justify-center aspect-square ${getCardStyles()} active:opacity-80`}
      onPress={onPress}
    >
      <View
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full items-center justify-center mb-2.5 ${getCircleBackground()}`}
      >
        {renderIcon()}
      </View>
      <Text
        className={`text-sm md:text-base font-bold text-center ${getTextColor()}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
