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
    if (timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsExpired(true);
      onExpireRef.current();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsExpired(true);
          onExpireRef.current();
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
