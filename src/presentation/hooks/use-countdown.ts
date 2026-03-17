import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook para gerenciar contagem regressiva
 * @param durationMs Duração total em milissegundos
 * @param onExpire Callback chamado quando o tempo expira
 * @returns { timeLeft: string, isExpired: boolean } Tempo restante no formato MM:SS e flag de expirado
 */
export function useCountdown(
  durationMs: number,
  onExpire: () => void,
): { timeLeft: string; isExpired: boolean } {
  const [timeLeft, setTimeLeft] = useState<number>(durationMs);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false); // Flag para garantir que onExpire seja chamado apenas uma vez

  // Atualiza a referência do callback sempre que ele mudar
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Formata milissegundos para MM:SS
  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return "00:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Inicia/limpa o intervalo
  useEffect(() => {
    // Se o tempo já expirou, chama onExpire imediatamente (apenas uma vez)
    if (timeLeft <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      setIsExpired(true);
      onExpireRef.current();
      return;
    }

    // Limpa intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Se já expirou, não cria novo intervalo
    if (timeLeft <= 0) {
      return;
    }

    // Cria novo intervalo
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          // Marca como expirado e chama callback apenas uma vez
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            setIsExpired(true);
            onExpireRef.current();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft]);

  return {
    timeLeft: formatTime(timeLeft),
    isExpired,
  };
}
