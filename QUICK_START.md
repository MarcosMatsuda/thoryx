# 🚀 Quick Start - Clean Architecture

Quick reference guide for working with Clean Architecture in this project.

## 📁 Where to Put Each Thing?

### Business Rules
**→ `src/domain/`**
- Validations
- Calculations
- Pure business logic

### Data Access
**→ `src/data/`**
- API calls
- Database access
- Cache

### External Libraries
**→ `src/infrastructure/`**
- Expo APIs (SecureStore, FileSystem)
- React Native APIs
- Third-party SDKs

### User Interface
**→ `src/presentation/`**
- React Native components
- Screens
- UI hooks
- Styles

### Shared Code
**→ `src/shared/`**
- TypeScript types
- Pure utilities
- Constants

## 🎯 Feature Creation Flow

### 1. Define Entity (Domain)
```typescript
// src/domain/entities/Product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

### 2. Create Repository Interface (Domain)
```typescript
// src/domain/repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
}
```

### 3. Create Use Case (Domain)
```typescript
// src/domain/use-cases/GetProductUseCase.ts
export class GetProductUseCase {
  constructor(private repo: IProductRepository) {}
  
  async execute(id: string): Promise<Product | null> {
    if (!id) throw new Error('ID required');
    return await this.repo.findById(id);
  }
}
```

### 4. Implement Repository (Data)
```typescript
// src/data/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  constructor(private http: HttpClient) {}
  
  async findById(id: string): Promise<Product | null> {
    const res = await this.http.get(`/products/${id}`);
    return res.data;
  }
}
```

### 5. Use in Screen (Presentation)
```typescript
// src/presentation/screens/ProductScreen.tsx
export function ProductScreen({ id }: Props) {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    // Manual DI
    const http = new HttpClient({ baseURL: API_URL });
    const repo = new ProductRepository(http);
    const useCase = new GetProductUseCase(repo);
    
    useCase.execute(id).then(setProduct);
  }, [id]);
  
  return <Text>{product?.name}</Text>;
}
```

## 🚫 What NOT to Do

### ❌ Domain importing Infrastructure
```typescript
// src/domain/use-cases/SaveUser.ts
import * as SecureStore from 'expo-secure-store'; // WRONG!
```

### ❌ Presentation accessing Repository
```typescript
// src/presentation/screens/Home.tsx
import { UserRepository } from '@data/repositories/UserRepository'; // WRONG!
// Use Use Cases instead!
```

### ❌ Business Logic in Presentation
```typescript
// src/presentation/screens/Login.tsx
const isValidEmail = (email: string) => {
  // WRONG! This is business logic, goes to Domain!
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

## ✅ Allowed Imports

### Domain
```typescript
// ✅ Allowed
import { ValidationUtils } from '@shared/utils/validation';
import { Result } from '@shared/types/Result';

// ❌ Forbidden
import { UserRepository } from '@data/repositories/UserRepository';
import * as SecureStore from 'expo-secure-store';
import { View } from 'react-native';
```

### Data
```typescript
// ✅ Allowed
import { User } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { SecureStorageAdapter } from '@infrastructure/storage/SecureStorageAdapter';

// ❌ Forbidden
import { UserScreen } from '@presentation/screens/UserScreen';
```

### Infrastructure
```typescript
// ✅ Allowed
import * as SecureStore from 'expo-secure-store';
import { ILocalDataSource } from '@data/sources/ILocalDataSource';

// ❌ Forbidden
import { User } from '@domain/entities/User';
import { UserScreen } from '@presentation/screens/UserScreen';
```

### Presentation
```typescript
// ✅ Allowed
import { View, Text } from 'react-native';
import { GetUserUseCase } from '@domain/use-cases/GetUserUseCase';
import { ThemedText } from '@presentation/components/themed-text';

// ❌ Forbidden
import { UserRepository } from '@data/repositories/UserRepository';
import * as SecureStore from 'expo-secure-store';
```

## 📦 Path Aliases

Always use the configured aliases:

```typescript
// ✅ Correct
import { User } from '@domain/entities/User';
import { UserRepository } from '@data/repositories/UserRepository';
import { HttpClient } from '@infrastructure/http/HttpClient';
import { ThemedText } from '@presentation/components/themed-text';
import { ValidationUtils } from '@shared/utils/validation';

// ❌ Wrong
import { User } from '../../../domain/entities/User';
```

## 🧪 Testing

### Testing Use Cases
```typescript
// __tests__/domain/use-cases/GetUserUseCase.test.ts
const mockRepo: IUserRepository = {
  findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test' })
};

const useCase = new GetUserByIdUseCase(mockRepo);
const result = await useCase.execute('1');

expect(result).toEqual({ id: '1', name: 'Test' });
```

### Testing Repositories
```typescript
// __tests__/data/repositories/UserRepository.test.ts
const mockDataSource = {
  get: jest.fn().mockResolvedValue({ id: '1', name: 'Test' })
};

const repo = new UserRepository(mockDataSource);
const result = await repo.findById('1');

expect(result).toBeDefined();
```

## 💡 Tips

1. **Always start with Domain** - Define entities and use cases first
2. **Use Interfaces** - Facilitates testing and decoupling
3. **Manual DI** - Inject dependencies via constructor
4. **No Logic in Presentation** - Only use case orchestration
5. **Isolate Libraries** - Always in Infrastructure

## 📚 More Information

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete documentation
- [.cursor/rules/clean-architecture.md](.cursor/rules/clean-architecture.md) - Detailed rules
- [README.md](README.md) - Project overview

## 🆘 Need Help?

Ask yourself:

1. **"Is this business logic?"** → Domain
2. **"Does this access data?"** → Data
3. **"Does this use external library?"** → Infrastructure
4. **"Is this UI?"** → Presentation
5. **"Is this used by everyone?"** → Shared
