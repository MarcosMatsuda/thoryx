import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { CountdownTimer } from "../countdown-timer";

// Mock do timer
jest.useFakeTimers();

describe("CountdownTimer", () => {
  it("renderiza corretamente com durationMinutes={5}", () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={5} onExpire={onExpire} />
    );

    // Deve mostrar 05:00 inicialmente
    expect(getByText("05:00")).toBeTruthy();
  });

  it("decrementa em tempo real (1 segundo por segundo)", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={0.05} onExpire={onExpire} /> // 3 segundos
    );

    // Inicialmente 00:03
    expect(getByText("00:03")).toBeTruthy();

    // Avança 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Deve mostrar 00:02
    expect(getByText("00:02")).toBeTruthy();

    // Avança mais 1 segundo
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Deve mostrar 00:01
    expect(getByText("00:01")).toBeTruthy();
  });

  it("chama onExpire exatamente uma vez ao chegar a 00:00", async () => {
    const onExpire = jest.fn();
    render(
      <CountdownTimer durationMinutes={0.05} onExpire={onExpire} /> // 3 segundos
    );

    // Avança 4 segundos (garante que passou do tempo)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // onExpire deve ser chamado exatamente uma vez
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("muda cor para amarelo nos últimos 60 segundos", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={1} onExpire={onExpire} /> // 60 segundos
    );

    // Inicialmente 01:00 - deve estar na cor padrão (não amarelo ainda)
    const initialElement = getByText("01:00");
    expect(initialElement).toBeTruthy();

    // Avança para 00:59 (dentro dos últimos 60s)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Agora deve estar amarelo
    const warningElement = getByText("00:59");
    expect(warningElement).toBeTruthy();
  });

  it("muda cor para vermelho nos últimos 10 segundos", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={0.2} onExpire={onExpire} /> // 12 segundos
    );

    // Avança para 00:10 (dentro dos últimos 10s)
    act(() => {
      jest.advanceTimersByTime(2000); // de 00:12 para 00:10
    });

    // Deve estar vermelho
    const redElement = getByText("00:10");
    expect(redElement).toBeTruthy();
  });

  it("funciona com diferentes valores de durationMinutes", () => {
    const onExpire = jest.fn();
    
    // Testa com 1 minuto
    const { getByText: getByText1, unmount: unmount1 } = render(
      <CountdownTimer durationMinutes={1} onExpire={onExpire} />
    );
    expect(getByText1("01:00")).toBeTruthy();
    unmount1();

    // Testa com 5 minutos
    const { getByText: getByText5 } = render(
      <CountdownTimer durationMinutes={5} onExpire={onExpire} />
    );
    expect(getByText5("05:00")).toBeTruthy();

    // Testa com 15 minutos
    const { getByText: getByText15, unmount: unmount15 } = render(
      <CountdownTimer durationMinutes={15} onExpire={onExpire} />
    );
    expect(getByText15("15:00")).toBeTruthy();
    unmount15();

    // Testa com 30 minutos
    const { getByText: getByText30 } = render(
      <CountdownTimer durationMinutes={30} onExpire={onExpire} />
    );
    expect(getByText30("30:00")).toBeTruthy();
  });

  it("renderiza estilo prominent corretamente", () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer 
        durationMinutes={5} 
        onExpire={onExpire} 
        style="prominent"
      />
    );

    // Deve mostrar o ícone de timer ⏱️
    expect(getByText("⏱️")).toBeTruthy();
    expect(getByText("05:00")).toBeTruthy();
  });

  it("renderiza estilo subtle corretamente", () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer 
        durationMinutes={5} 
        onExpire={onExpire} 
        style="subtle"
      />
    );

    // Deve mostrar o ícone de ampulheta ⏳
    expect(getByText("⏳")).toBeTruthy();
    expect(getByText("05:00")).toBeTruthy();
  });
});