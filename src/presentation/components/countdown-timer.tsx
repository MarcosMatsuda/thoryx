import { View, Text } from "react-native";
import { useCountdown } from "../hooks/use-countdown";
import { DesignTokens } from "../theme/design-tokens";

interface CountdownTimerProps {
  durationMinutes: number; // duração total em minutos
  onExpire: () => void; // callback chamado quando zera
  style?: "prominent" | "subtle"; // prominent = grande e visível, subtle = pequeno
}

/**
 * Componente de contador regressivo reutilizável
 * Exibe tempo no formato MM:SS com mudança de cor nos últimos 60s (amarelo) e 10s (vermelho)
 */
export function CountdownTimer({
  durationMinutes,
  onExpire,
  style = "prominent",
}: CountdownTimerProps) {
  const durationMs = durationMinutes * 60 * 1000;
  const { timeLeft, isExpired } = useCountdown(durationMs, onExpire);

  // Calcula o tempo restante em segundos para determinar a cor
  const [minutes, seconds] = timeLeft.split(":").map(Number);
  const totalSeconds = minutes * 60 + seconds;

  // Determina a cor baseada no tempo restante
  let textColor: string = DesignTokens.colors.text.primary;
  let iconColor: string = DesignTokens.colors.text.primary;

  if (totalSeconds <= 10) {
    // Últimos 10 segundos: vermelho
    textColor = DesignTokens.colors.status.error;
    iconColor = DesignTokens.colors.status.error;
  } else if (totalSeconds <= 60) {
    // Últimos 60 segundos: amarelo/laranja
    textColor = DesignTokens.colors.status.warning;
    iconColor = DesignTokens.colors.status.warning;
  }

  // Ícone baseado no estilo
  const icon = style === "prominent" ? "⏱️" : "⏳";

  if (style === "prominent") {
    return (
      <View className="flex-row items-center justify-center bg-background-secondary rounded-xl px-4 py-3">
        <Text className="text-xl mr-2" style={{ color: iconColor }}>
          {icon}
        </Text>
        <Text
          className="text-2xl font-bold tracking-wider"
          style={{ color: textColor }}
        >
          {timeLeft}
        </Text>
      </View>
    );
  }

  // Estilo subtle
  return (
    <View className="flex-row items-center">
      <Text className="text-sm mr-1" style={{ color: iconColor }}>
        {icon}
      </Text>
      <Text
        className="text-base font-medium"
        style={{ color: textColor }}
      >
        {timeLeft}
      </Text>
    </View>
  );
}