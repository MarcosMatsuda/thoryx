import React from "react";
import { View, Text, Pressable, type PressableProps } from "react-native";

export interface ThoryxHeaderProps {
  /** Elemento à esquerda (geralmente botão de voltar) */
  left?: React.ReactNode;
  /** Elemento no centro (geralmente título) */
  center?: React.ReactNode;
  /** Elemento à direita (geralmente ação) */
  right?: React.ReactNode;
  /** Classe CSS adicional para o container */
  className?: string;
}

/**
 * Componente de header padrão do Thoryx
 *
 * Baseado no padrão da tela de Emergency Information:
 * - flex-row items-center justify-between px-6 py-4 border-b border-ui-border
 * - Estrutura: [left] [center] [right]
 *
 * @example
 * // Header apenas com seta de voltar (Change Pin)
 * <ThoryxHeader
 *   left={
 *     <Pressable onPress={handleBack}>
 *       <Text className="text-2xl text-text-primary">←</Text>
 *     </Pressable>
 *   }
 * />
 *
 * @example
 * // Header completo (Emergency Information)
 * <ThoryxHeader
 *   left={<BackButton />}
 *   center={<Text className="text-lg font-semibold">Emergency Profile</Text>}
 *   right={<EditButton />}
 * />
 */
export function ThoryxHeader({
  left,
  center,
  right,
  className = "",
}: ThoryxHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-6 py-4 border-b border-ui-border ${className}`}
    >
      {/* Elemento à esquerda */}
      <View className="min-w-10">{left || <View className="w-10" />}</View>

      {/* Elemento no centro */}
      <View className="flex-1 items-center">{center || <View />}</View>

      {/* Elemento à direita */}
      <View className="min-w-10 items-end">
        {right || <View className="w-10" />}
      </View>
    </View>
  );
}

/**
 * Botão de voltar padrão para uso com ThoryxHeader
 */
export function BackButton({
  onPress,
  className = "",
  ...props
}: PressableProps & { className?: string }) {
  return (
    <Pressable
      className={`w-10 h-10 items-center justify-center active:bg-surface-hover rounded-full ${className}`}
      onPress={onPress}
      {...props}
    >
      <Text className="text-2xl text-text-primary">←</Text>
    </Pressable>
  );
}

/**
 * Botão de edição padrão para uso com ThoryxHeader
 */
export function EditButton({
  onPress,
  className = "",
  ...props
}: PressableProps & { className?: string }) {
  return (
    <Pressable
      className={`w-10 h-10 items-center justify-center active:bg-surface-hover rounded-full ${className}`}
      onPress={onPress}
      {...props}
    >
      <Text className="text-lg text-primary-main">✏️</Text>
    </Pressable>
  );
}
