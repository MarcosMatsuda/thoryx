import { renderHook, act } from "@testing-library/react-native";
import { useCountdown } from "../use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("formata o tempo corretamente", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(300000, onExpire)); // 5 minutos

    // Deve formatar 5 minutos como 05:00
    expect(result.current.timeLeft).toBe("05:00");
    expect(result.current.isExpired).toBe(false);
  });

  it("decrementa o tempo real (1 segundo por segundo) usando jest.useFakeTimers", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(5000, onExpire)); // 5 segundos

    // Inicialmente 00:05
    expect(result.current.timeLeft).toBe("00:05");
    expect(result.current.isExpired).toBe(false);

    // Avança 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe("00:04");

    // Avança mais 2 segundos
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.timeLeft).toBe("00:02");

    // Avança até o final
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.timeLeft).toBe("00:00");
    expect(result.current.isExpired).toBe(true);
  });

  it("chama onExpire EXATAMENTE UMA VEZ quando o tempo acaba", () => {
    const onExpire = jest.fn();
    renderHook(() => useCountdown(3000, onExpire)); // 3 segundos

    // Avança até expirar
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Deve ser chamado exatamente uma vez
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("NÃO chama onExpire mais de uma vez mesmo com múltiplas renderizações", () => {
    const onExpire = jest.fn();
    const { rerender } = renderHook(
      ({ duration }: { duration: number }) => useCountdown(duration, onExpire),
      { initialProps: { duration: 3000 } },
    );

    // Avança até expirar
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Re-render com mesma duração (já expirado)
    rerender({ duration: 3000 });

    // Re-render novamente
    rerender({ duration: 3000 });

    // Deve ser chamado exatamente uma vez
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("chama onExpire imediatamente se duration for 0", () => {
    const onExpire = jest.fn();
    renderHook(() => useCountdown(0, onExpire));

    // Deve chamar imediatamente
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onExpire).toHaveBeenCalled();
  });

  it("chama onExpire imediatamente se duration for negativa", () => {
    const onExpire = jest.fn();
    renderHook(() => useCountdown(-1000, onExpire));

    // Deve chamar imediatamente
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onExpire).toHaveBeenCalled();
  });

  it("marca como expirado quando o tempo acaba", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(2000, onExpire)); // 2 segundos

    // Inicialmente não expirado
    expect(result.current.isExpired).toBe(false);
    expect(result.current.timeLeft).toBe("00:02");

    // Avança até expirar
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Deve estar expirado
    expect(result.current.isExpired).toBe(true);
    expect(result.current.timeLeft).toBe("00:00");
  });

  it("limpa o intervalo corretamente quando o componente desmonta", () => {
    const onExpire = jest.fn();
    const { unmount } = renderHook(() => useCountdown(10000, onExpire)); // 10 segundos

    // Avança um pouco
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Desmonta o hook
    unmount();

    // Avança mais tempo - não deve chamar onExpire porque foi desmontado
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // onExpire não deve ser chamado porque o timer foi limpo
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("formata corretamente tempos menores que 10 segundos", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(9000, onExpire)); // 9 segundos

    // Deve formatar como 00:09
    expect(result.current.timeLeft).toBe("00:09");
  });

  it("formata corretamente tempos maiores que 10 minutos", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(900000, onExpire)); // 15 minutos

    // Deve formatar como 15:00
    expect(result.current.timeLeft).toBe("15:00");
  });

  it("atualiza o callback onExpire quando ele muda", () => {
    const onExpire1 = jest.fn();
    const onExpire2 = jest.fn();

    const { rerender } = renderHook(
      ({ onExpire }: { onExpire: () => void }) => useCountdown(5000, onExpire),
      { initialProps: { onExpire: onExpire1 } },
    );

    // Muda o callback antes de expirar
    rerender({ onExpire: onExpire2 });

    // Avança até expirar
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // onExpire2 deve ser chamado, onExpire1 não
    expect(onExpire1).not.toHaveBeenCalled();
    expect(onExpire2).toHaveBeenCalledTimes(1);
  });
});
