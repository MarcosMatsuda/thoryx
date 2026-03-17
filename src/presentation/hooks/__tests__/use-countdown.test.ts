import { renderHook, act } from "@testing-library/react-native";
import { useCountdown } from "../use-countdown";

// Mock do timer
jest.useFakeTimers();

describe("useCountdown", () => {
  it("formata o tempo corretamente", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(300000, onExpire)); // 5 minutos

    // Deve formatar 5 minutos como 05:00
    expect(result.current.timeLeft).toBe("05:00");
    expect(result.current.isExpired).toBe(false);
  });

  it("decrementa o tempo a cada segundo", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(5000, onExpire)); // 5 segundos

    // Inicialmente 00:05
    expect(result.current.timeLeft).toBe("00:05");

    // Avança 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Deve ser 00:04
    expect(result.current.timeLeft).toBe("00:04");

    // Avança mais 2 segundos
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Deve ser 00:02
    expect(result.current.timeLeft).toBe("00:02");
  });

  it("chama onExpire quando o tempo acaba", () => {
    const onExpire = jest.fn();
    renderHook(() => useCountdown(3000, onExpire)); // 3 segundos

    // Avança 4 segundos (garante que passou do tempo)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // onExpire deve ser chamado
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("marca como expirado quando o tempo acaba", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(2000, onExpire)); // 2 segundos

    // Inicialmente não expirado
    expect(result.current.isExpired).toBe(false);

    // Avança 3 segundos
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Deve estar expirado
    expect(result.current.isExpired).toBe(true);
    expect(result.current.timeLeft).toBe("00:00");
  });

  it("limpa o intervalo quando o componente desmonta", () => {
    const onExpire = jest.fn();
    const { unmount } = renderHook(() => useCountdown(10000, onExpire)); // 10 segundos

    // Desmonta o hook
    unmount();

    // Avança o tempo
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // onExpire não deve ser chamado porque o intervalo foi limpo
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("formata corretamente tempos menores que 10 segundos", () => {
    const onExpire = jest.fn();
    const { result } = renderHook(() => useCountdown(9000, onExpire)); // 9 segundos

    // Deve formatar como 00:09
    expect(result.current.timeLeft).toBe("00:09");

    // Avança 5 segundos
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Deve formatar como 00:04
    expect(result.current.timeLeft).toBe("00:04");
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

    // Muda o callback
    rerender({ onExpire: onExpire2 });

    // Avança o tempo para expirar
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Deve chamar o segundo callback, não o primeiro
    expect(onExpire1).not.toHaveBeenCalled();
    expect(onExpire2).toHaveBeenCalledTimes(1);
  });
});
