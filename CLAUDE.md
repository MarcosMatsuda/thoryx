# Thoryx

Carteira digital de documentos com foco em privacidade. App mobile com armazenamento local seguro, autenticação por PIN e acesso protegido a documentos.

## Stack

- **React Native** 0.81 + **Expo** 54 (managed workflow)
- **React** 19.1 com React Compiler habilitado
- **TypeScript** 5.9 (strict mode)
- **NativeWind** 4 (TailwindCSS para RN)
- **Zustand** 5 para state management
- **Expo Router** 6 (file-based routing)
- **React Native Reanimated** 4 para animações
- **Expo Secure Store** para armazenamento seguro
- **React Native MMKV** para storage performático
- **React Native Vision Camera** + OCR para scan de documentos
- **Node.js** 20 LTS

## Arquitetura — Clean Architecture

```
src/
├── domain/          # Entidades, interfaces de repositório, use cases
│   ├── entities/
│   ├── repositories/
│   └── use-cases/
├── data/            # Implementações de repositório, DTOs, data sources
│   ├── repositories/
│   ├── models/
│   └── sources/
├── infrastructure/  # Adapters para libs externas (SecureStore, HTTP, crypto)
│   ├── storage/
│   ├── http/
│   ├── crypto/
│   └── file-system/
├── presentation/    # Screens, componentes UI, hooks, theme
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── theme/
│   ├── types/
│   └── utils/
├── shared/          # Tipos, utilitários e constantes compartilhados
│   ├── types/
│   ├── utils/
│   └── constants/
├── stores/          # Zustand stores (cards, documents, profile)
└── __mocks__/
```

### Regras de dependência

- **Domain** → não importa de nenhuma outra camada
- **Data** → importa de Domain e Infrastructure
- **Infrastructure** → não importa de Domain ou Presentation
- **Presentation** → usa Use Cases do Domain (nunca acessa Data diretamente)
- **Shared** → pode ser importado por qualquer camada, não importa de nenhuma

### Injeção de dependência

Manual — instancia adapters, repositories e use cases explicitamente.

## Path Aliases

```
@/*              → ./*
@domain/*        → ./src/domain/*
@data/*          → ./src/data/*
@infrastructure/* → ./src/infrastructure/*
@presentation/*  → ./src/presentation/*
@shared/*        → ./src/shared/*
@stores/*        → ./src/stores/*
```

## Routing

Expo Router com file-based routing em `app/`:

```
app/
├── (tabs)/          # Tab navigation
│   └── _layout.tsx
├── _layout.tsx      # Root layout
├── index.tsx        # Entry (splash/redirect)
├── splash.tsx
├── pin-setup.tsx
├── unlock.tsx
├── home.tsx
├── add-document.tsx
├── add-credit-card.tsx
├── document-details.tsx
├── profile-setup.tsx
├── change-pin.tsx
├── emergency.tsx
├── emergency-setup.tsx
├── guest-mode.tsx
├── select-documents.tsx
├── privacy-policy.tsx
└── terms-of-service.tsx
```

## Design System

- **Tema escuro** como padrão
- Cores definidas em `tailwind.config.js`
- Primary: `#135BEC`, Background: `#0A1628`
- Usar classes NativeWind (TailwindCSS) para estilização

## Testes

```bash
npm test              # Roda todos (unit + components)
npm test -- --selectProjects unit        # Só unit tests
npm test -- --selectProjects components  # Só component tests
npm run test:coverage # Com coverage report
```

- **Unit tests** (`.test.ts`): Jest + ts-jest, environment node
- **Component tests** (`.test.tsx`): Jest + jest-expo, environment jsdom
- Testing Library: `@testing-library/react-native`
- Stores têm testes: `cards.store.test.ts`, `documents.store.test.ts`, `profile.store.test.ts`

## Linting & Formatting

```bash
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier
```

- ESLint flat config (v9) com `eslint-config-expo`
- Prettier
- Husky para pre-commit hooks

## CI/CD (GitHub Actions)

### `ci.yml` — Roda em PRs para `develop` e `main`

1. **Security Audit** → `npm audit --audit-level=high`
2. **Lint** → `npm run lint` (depende de audit)
3. **TypeScript** → `npx tsc --noEmit` (depende de audit)
4. **Tests** → `npm test` (depende de lint + typecheck)

### `close-issues-on-merge.yml`

Fecha issues referenciadas no body do PR quando mergeado (Closes #N, Fixes #N).

## Branches

- `main` — produção
- `develop` — desenvolvimento
- Feature branches: `feat/nome`
- Fix branches: `fix/nome`

## Commits

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- Mensagens em inglês
- **Nunca mencionar IA, Claude, ou ferramentas automatizadas** em commits ou PRs
- PRs devem referenciar issues quando aplicável: `Closes #N`

## Scripts úteis

```bash
npm start             # Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser
npx tsc --noEmit      # Type check
```

## Pipeline de Qualidade

### Testes obrigatórios

- **Use cases e repositories** → unit tests (`.test.ts`)
- **Screens e componentes** → component tests (`.test.tsx`)
- **Zustand stores** → unit tests (já existem para cards, documents, profile)
- Novos use cases ou stores **devem ter testes** antes de abrir PR

### Checklist de PR

1. `npm run lint` passa sem erros
2. `npx tsc --noEmit` passa
3. `npm test` passa (unit + component)
4. Segue regras de Clean Architecture (ver seção Regras de dependência)
5. Sem lógica de negócio na camada Presentation
6. PR referencia issue quando aplicável (`Closes #N`)

### CI automático (PRs para develop/main)

Pipeline sequencial: Security Audit → Lint + TypeScript (paralelo) → Tests

Se CI falhar, corrigir antes de pedir review.

### Labels de status

| Label                  | Significado                              |
| ---------------------- | ---------------------------------------- |
| `task`                 | Nova tarefa criada                       |
| `wip`                  | Trabalho em andamento                    |
| `needs-tests`          | Precisa de testes antes de review        |
| `needs-fix`            | Bug ou correção necessária               |
| `tests-ready`          | Testes escritos e passando               |
| `qa-approved`          | QA aprovou — pronto para merge           |
| `qa-changes-requested` | QA encontrou problemas — ver comentários |

### QA verifica

- Funcionalidade conforme a issue/task
- Edge cases (inputs inválidos, estados vazios, erros de rede)
- Conformidade com Clean Architecture (sem violações de camada)
- Performance (sem re-renders desnecessários, animações fluidas)
- Acessibilidade básica (labels, contraste)

## Observações

- New Architecture habilitada (`newArchEnabled: true`)
- Typed Routes habilitado (experimental)
- React Compiler habilitado (experimental)
- `npm ci --legacy-peer-deps` necessário para install
