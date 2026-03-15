# Testing with React Testing Library (RTL)

## Configuração

O projeto está configurado para usar **React Testing Library** com **jest-expo**. As dependências já estão instaladas:

```json
"@testing-library/react-native": "^13.3.3",
"@testing-library/jest-native": "^5.4.3"
```

## Estrutura de Testes

### 1. Testes de Unidade (TypeScript puro)

- Local: `src/**/*.test.ts`
- Ambiente: Node.js
- Para: Utilitários, helpers, lógica de negócio

### 2. Testes de Componentes (React Native)

- Local: `src/**/*.test.tsx`
- Ambiente: jest-expo + jsdom
- Para: Componentes React Native

## Escrevendo Testes com RTL

### Exemplo Básico

```tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("handles press events", () => {
    const onPress = jest.fn();
    render(<MyComponent onPress={onPress} />);

    fireEvent.press(screen.getByText("Click me"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Matchers do jest-native

O `@testing-library/jest-native` adiciona matchers específicos para React Native:

```tsx
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toBeEmptyElement();
expect(element).toContainElement(child);
expect(element).toHaveTextContent("text");
expect(element).toHaveProp("propName", "value");
expect(element).toHaveStyle({ backgroundColor: "red" });
```

### Mocking de Dependências

Para componentes que usam bibliotecas nativas:

```tsx
// Mock react-native-svg
jest.mock("react-native-svg", () => ({
  SvgXml: () => null,
}));

// Mock expo modules
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));
```

## Configuração do Jest

O `jest.config.js` já está configurado com:

- `setupFilesAfterEnv: ['<rootDir>/jest.setup.js']` para RTL
- Dois projetos: `unit` (TypeScript) e `components` (React Native)
- Suporte a TypeScript com `ts-jest`
- Mocks para bibliotecas nativas

## Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPatterns=validation.test.ts

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Boas Práticas

1. **Teste comportamento, não implementação**
2. **Use queries acessíveis** (`getByText`, `getByRole`, `getByTestId`)
3. **Mock apenas o necessário** para isolar o componente
4. **Mantenha testes simples** e focados
5. **Use `fireEvent` para interações do usuário**

## Solução de Problemas

### Erro: "You are trying to `import` a file outside of the scope"

- Verifique se todos os mocks estão definidos antes dos imports
- Use `jest.mock()` no topo do arquivo

### Erro com bibliotecas nativas

- Adicione mocks no `jest.setup.js` ou no próprio arquivo de teste
- Consulte a documentação do jest-expo para mocks comuns

### Testes lentos

- Use `transformIgnorePatterns` para evitar transformar node_modules desnecessários
- Considere mockar componentes pesados
