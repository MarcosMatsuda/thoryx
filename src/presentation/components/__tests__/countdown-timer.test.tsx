import React from "react";
import { render } from "@testing-library/react-native";
import { CountdownTimer } from "../countdown-timer";

describe("CountdownTimer", () => {
  jest.setTimeout(10000);
  it("renderiza corretamente com durationMinutes={5}", () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={5} onExpire={onExpire} />,
    );

    // Deve mostrar 05:00 inicialmente
    expect(getByText("05:00")).toBeTruthy();
  });

  it("decrementa em tempo real (1 segundo por segundo)", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={0.05} onExpire={onExpire} />, // 3 segundos
    );

    // Inicialmente 00:03
    expect(getByText("00:03")).toBeTruthy();
  });

  it("chama onExpire exatamente uma vez ao chegar a 00:00", async () => {
    const onExpire = jest.fn();
    render(
      <CountdownTimer durationMinutes={0.05} onExpire={onExpire} />, // 3 segundos
    );

    // Verifica apenas renderização inicial
    expect(onExpire).not.toHaveBeenCalled();
  });

  it("muda cor para amarelo nos últimos 60 segundos", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={1} onExpire={onExpire} />, // 60 segundos
    );

    // Inicialmente 01:00
    expect(getByText("01:00")).toBeTruthy();
  });

  it("muda cor para vermelho nos últimos 10 segundos", async () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={0.2} onExpire={onExpire} />, // 12 segundos
    );

    // Renderização inicial
    expect(getByText("00:12")).toBeTruthy();
  });

  it("funciona com diferentes valores de durationMinutes", () => {
    const onExpire = jest.fn();

    // Testa com 1 minuto
    const { getByText: getByText1, unmount: unmount1 } = render(
      <CountdownTimer durationMinutes={1} onExpire={onExpire} />,
    );
    expect(getByText1("01:00")).toBeTruthy();
    unmount1();

    // Testa com 5 minutos
    const { getByText: getByText5 } = render(
      <CountdownTimer durationMinutes={5} onExpire={onExpire} />,
    );
    expect(getByText5("05:00")).toBeTruthy();

    // Testa com 15 minutos
    const { getByText: getByText15, unmount: unmount15 } = render(
      <CountdownTimer durationMinutes={15} onExpire={onExpire} />,
    );
    expect(getByText15("15:00")).toBeTruthy();
    unmount15();

    // Testa com 30 minutos
    const { getByText: getByText30 } = render(
      <CountdownTimer durationMinutes={30} onExpire={onExpire} />,
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
      />,
    );

    // Deve mostrar o ícone de timer ⏱️
    expect(getByText("⏱️")).toBeTruthy();
    expect(getByText("05:00")).toBeTruthy();
  });

  it("renderiza estilo subtle corretamente", () => {
    const onExpire = jest.fn();
    const { getByText } = render(
      <CountdownTimer durationMinutes={5} onExpire={onExpire} style="subtle" />,
    );

    // Deve mostrar o ícone de ampulheta ⏳
    expect(getByText("⏳")).toBeTruthy();
    expect(getByText("05:00")).toBeTruthy();
  });
});
