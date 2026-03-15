# Clean Architecture Rule

This project follows a strict Clean Architecture pattern.

## Layer Structure

```
src/
├── domain/          # Domain Layer (Business Rules)
├── data/            # Data Layer (Repository Implementations)
├── infrastructure/  # Infrastructure Layer (External Libraries)
├── presentation/    # Presentation Layer (UI)
└── shared/          # Cross-cutting Concerns
```

## Dependency Rules

### 1. Domain Layer

**Responsibilities:**

- Define domain entities
- Define repository interfaces
- Implement use cases
- Contain pure business rules

**Restrictions:**

- ❌ NEVER import from `data`, `infrastructure`, or `presentation`
- ❌ NEVER depend on external libraries (except pure TypeScript)
- ✅ Can only import from `@shared/types` and `@shared/utils` (pure functions)

**Correct Example:**

```typescript
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) {}
}

// src/domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
}

// src/domain/use-cases/GetUserByIdUseCase.ts
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }
}
```

**Incorrect Example:**

```typescript
// ❌ WRONG: Domain importing from infrastructure
import * as SecureStore from "expo-secure-store";

// ❌ WRONG: Domain importing from data
import { UserRepository } from "@data/repositories/UserRepository";
```

### 2. Data Layer

**Responsibilities:**

- Implement repository interfaces defined in domain
- Define DTOs and data models
- Manage data sources (local/remote)

**Restrictions:**

- ✅ MUST implement interfaces from `@domain/repositories`
- ✅ Can import from `@domain` (entities and interfaces)
- ✅ Can import from `@infrastructure` (adapters)
- ❌ NEVER import from `@presentation`

**Correct Example:**

```typescript
// src/data/repositories/UserRepository.ts
import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { ILocalDataSource } from "@data/sources/ILocalDataSource";

export class UserRepository implements IUserRepository {
  constructor(private readonly dataSource: ILocalDataSource<UserDTO>) {}

  async findById(id: string): Promise<User | null> {
    const dto = await this.dataSource.get(id);
    return dto ? UserModel.toDomain(dto) : null;
  }
}
```

### 3. Infrastructure Layer

**Responsibilities:**

- Isolate external libraries (Expo, React Native, etc)
- Provide adapters for data sources
- Manage third-party APIs

**Restrictions:**

- ✅ Can import external libraries (Expo, React Native)
- ✅ Can implement interfaces from `@data/sources`
- ❌ NEVER import from `@domain` (except types if necessary)
- ❌ NEVER import from `@presentation`

**Correct Example:**

```typescript
// src/infrastructure/storage/SecureStorageAdapter.ts
import * as SecureStore from "expo-secure-store";
import { ILocalDataSource } from "@data/sources/ILocalDataSource";

export class SecureStorageAdapter<T> implements ILocalDataSource<T> {
  async get(key: string): Promise<T | null> {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  }
}
```

### 4. Presentation Layer

**Responsibilities:**

- UI Components
- Screens (containers)
- Custom hooks
- UI state management
- Theme and styles

**Restrictions:**

- ✅ Can import from `@domain/use-cases`
- ✅ Can import React Native, Expo Router
- ✅ Can import from `@shared`
- ❌ NEVER directly access `@data/repositories`
- ❌ NEVER directly access `@infrastructure`
- ❌ NEVER contain business logic

**Correct Example:**

```typescript
// src/presentation/screens/UserProfileScreen.tsx
import { useState, useEffect } from 'react';
import { GetUserByIdUseCase } from '@domain/use-cases/GetUserByIdUseCase';

export function UserProfileScreen({ userId }: Props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Manual dependency injection
    const useCase = new GetUserByIdUseCase(userRepository);
    useCase.execute(userId).then(setUser);
  }, [userId]);

  return <View>...</View>;
}
```

**Incorrect Example:**

```typescript
// ❌ WRONG: Presentation accessing repository directly
import { UserRepository } from "@data/repositories/UserRepository";

// ❌ WRONG: Business logic in presentation
export function UserProfileScreen() {
  const validateEmail = (email: string) => {
    // Business logic should be in domain!
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
}
```

### 5. Shared Layer

**Responsibilities:**

- Shared types
- Pure utilities (no side effects)
- Application constants

**Restrictions:**

- ✅ Can be imported by any layer
- ❌ NEVER import from other layers (except types)
- ❌ NEVER contain business logic
- ❌ NEVER contain side effects

## Dependency Injection

This project uses **Manual Dependency Injection** (via constructors/parameters).

**Example:**

```typescript
// Creating dependencies (usually in a setup file)
const localDataSource = new SecureStorageAdapter<UserDTO>();
const userRepository = new UserRepository(localDataSource);
const getUserUseCase = new GetUserByIdUseCase(userRepository);

// Usage in presentation
const user = await getUserUseCase.execute(userId);
```

## Validation Checklist

Before creating or modifying code, check:

- [ ] Domain does not import from other layers?
- [ ] Data implements Domain interfaces?
- [ ] Infrastructure isolates external libraries?
- [ ] Presentation uses Use Cases, not Repositories?
- [ ] Shared contains only pure code?
- [ ] Dependency Injection is being used correctly?
- [ ] Business logic is in Domain, not Presentation?

## Data Flow

```
User Interaction (Presentation)
    ↓
Use Case (Domain)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Data)
    ↓
Data Source (Infrastructure)
    ↓
External API/Storage
```

## Common Violations Examples

### ❌ Violation 1: Domain importing Infrastructure

```typescript
// src/domain/use-cases/SaveUserUseCase.ts
import * as SecureStore from "expo-secure-store"; // ❌ WRONG!
```

### ❌ Violation 2: Presentation accessing Repository

```typescript
// src/presentation/screens/HomeScreen.tsx
import { UserRepository } from "@data/repositories/UserRepository"; // ❌ WRONG!
```

### ❌ Violation 3: Business logic in Presentation

```typescript
// src/presentation/screens/LoginScreen.tsx
const validatePassword = (password: string) => {
  // ❌ WRONG! This should be in Domain
  return password.length >= 8;
};
```

### ✅ Correction: Use Cases in Domain

```typescript
// src/domain/use-cases/ValidatePasswordUseCase.ts
export class ValidatePasswordUseCase {
  execute(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password);
  }
}
```

## When Generating Code

When generating code for this project:

- Always respect layer boundaries
- Never mix infrastructure inside domain
- Prefer manual dependency injection
- Keep business logic in domain
- Use interfaces to decouple layers
