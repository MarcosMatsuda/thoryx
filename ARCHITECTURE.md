# Thoryx Project Architecture

## 📐 Overview

This project has been restructured to follow **Clean Architecture**, ensuring:
- Clear separation of concerns
- Testability
- Maintainability
- Framework independence

## 🏗️ Layer Structure

### 1. Domain Layer (`src/domain/`)

**Responsibility**: Pure business logic

**Contains**:
- `entities/` - Domain entities
- `repositories/` - Repository interfaces
- `use-cases/` - Use cases

**Rules**:
- ❌ Cannot import from other layers
- ❌ No external dependencies
- ✅ Only pure TypeScript

**Example**:
```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// src/domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
}

// src/domain/use-cases/GetUserByIdUseCase.ts
export class GetUserByIdUseCase {
  constructor(private readonly repository: IUserRepository) {}
  
  async execute(userId: string): Promise<User | null> {
    return await this.repository.findById(userId);
  }
}
```

### 2. Data Layer (`src/data/`)

**Responsibility**: Data access implementation

**Contains**:
- `repositories/` - Repository implementations
- `models/` - DTOs and converters
- `sources/` - Data source interfaces

**Rules**:
- ✅ Implements `@domain` interfaces
- ✅ Can import from `@domain` and `@infrastructure`
- ❌ Cannot import from `@presentation`

**Example**:
```typescript
// src/data/repositories/UserRepository.ts
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';

export class UserRepository implements IUserRepository {
  constructor(private readonly dataSource: ILocalDataSource) {}
  
  async findById(id: string): Promise<User | null> {
    const dto = await this.dataSource.get(id);
    return dto ? UserModel.toDomain(dto) : null;
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: Integration with external libraries

**Contains**:
- `storage/` - SecureStore, AsyncStorage
- `http/` - HTTP Client
- `crypto/` - Cryptography
- `file-system/` - FileSystem

**Rules**:
- ✅ Can use external libraries (Expo, React Native)
- ✅ Implements `@data/sources` interfaces
- ❌ Does not import from `@domain` or `@presentation`

**Example**:
```typescript
// src/infrastructure/storage/SecureStorageAdapter.ts
import * as SecureStore from 'expo-secure-store';
import { ILocalDataSource } from '@data/sources/ILocalDataSource';

export class SecureStorageAdapter<T> implements ILocalDataSource<T> {
  async get(key: string): Promise<T | null> {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**Responsibility**: User interface

**Contains**:
- `screens/` - Screens (containers)
- `components/` - UI components
- `hooks/` - Custom hooks
- `theme/` - Theme and styles

**Rules**:
- ✅ Uses `@domain/use-cases`
- ✅ Can use React Native, Expo Router
- ❌ Does not access `@data/repositories` directly
- ❌ No business logic

**Example**:
```typescript
// src/presentation/screens/UserProfileScreen.tsx
import { useState, useEffect } from 'react';
import { GetUserByIdUseCase } from '@domain/use-cases/GetUserByIdUseCase';

export function UserProfileScreen({ userId }: Props) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const useCase = new GetUserByIdUseCase(userRepository);
    useCase.execute(userId).then(setUser);
  }, [userId]);
  
  return <View>...</View>;
}
```

### 5. Shared Layer (`src/shared/`)

**Responsibility**: Code shared between layers

**Contains**:
- `types/` - Shared types
- `utils/` - Pure utilities
- `constants/` - Constants

**Rules**:
- ✅ Can be imported by any layer
- ❌ Does not import from other layers
- ❌ No side effects

## 🔄 Data Flow

```
User Action (Presentation)
    ↓
Use Case (Domain)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Data)
    ↓
Data Source Adapter (Infrastructure)
    ↓
External API/Storage
```

## 🎯 Dependency Injection

This project uses **Manual Dependency Injection**:

```typescript
// Setup (usually in a configuration file)
const httpClient = new HttpClient({ baseURL: API_URL });
const userRepository = new UserRepository(httpClient);
const getUserUseCase = new GetUserByIdUseCase(userRepository);

// Usage
const user = await getUserUseCase.execute(userId);
```

## 📦 Path Aliases

Configured in `tsconfig.json`:

```json
{
  "@domain/*": ["./src/domain/*"],
  "@data/*": ["./src/data/*"],
  "@infrastructure/*": ["./src/infrastructure/*"],
  "@presentation/*": ["./src/presentation/*"],
  "@shared/*": ["./src/shared/*"]
}
```

## ✅ Validation Checklist

Before creating/modifying code:

- [ ] Domain does not import from other layers?
- [ ] Data implements Domain interfaces?
- [ ] Infrastructure isolates external libraries?
- [ ] Presentation uses Use Cases?
- [ ] Shared contains only pure code?
- [ ] Dependency Injection is correct?
- [ ] Business logic is in Domain?

## 🚫 Common Violations

### ❌ Domain importing Infrastructure
```typescript
// src/domain/use-cases/SaveUserUseCase.ts
import * as SecureStore from 'expo-secure-store'; // WRONG!
```

### ❌ Presentation accessing Repository
```typescript
// src/presentation/screens/HomeScreen.tsx
import { UserRepository } from '@data/repositories/UserRepository'; // WRONG!
```

### ❌ Business logic in Presentation
```typescript
// src/presentation/screens/LoginScreen.tsx
const validateEmail = (email: string) => {
  // WRONG! Should be in Domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

## 📚 Example Files

The project includes complete examples:

- `src/domain/entities/User.ts`
- `src/domain/repositories/IUserRepository.ts`
- `src/domain/use-cases/GetUserByIdUseCase.ts`
- `src/data/repositories/UserRepository.ts`
- `src/data/models/UserModel.ts`
- `src/infrastructure/storage/SecureStorageAdapter.ts`
- `src/infrastructure/http/HttpClient.ts`
- `src/shared/types/Result.ts`
- `src/shared/utils/validation.ts`

## 🔗 References

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Cursor Rules](.cursor/rules/clean-architecture.md)
- [README.md](README.md)
