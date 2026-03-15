# Thoryx

React Native application with Expo following Clean Architecture.

## 🏗️ Architecture

This project follows **Clean Architecture** with clear separation between layers:

```
thoryx/
├── app/                    # Expo Router (routing only)
│   ├── _layout.tsx
│   ├── (tabs)/
│   └── modal.tsx
├── src/
│   ├── domain/            # 🎯 Domain Layer
│   │   ├── entities/      # Business entities
│   │   ├── repositories/  # Repository interfaces
│   │   └── use-cases/     # Use cases
│   ├── data/              # 💾 Data Layer
│   │   ├── repositories/  # Repository implementations
│   │   ├── models/        # DTOs and models
│   │   └── sources/       # Data sources (local/remote)
│   ├── infrastructure/    # 🔧 Infrastructure Layer
│   │   ├── storage/       # SecureStore, AsyncStorage
│   │   ├── crypto/        # Cryptography
│   │   ├── file-system/   # Expo FileSystem
│   │   └── http/          # HTTP Client
│   ├── presentation/      # 🎨 Presentation Layer
│   │   ├── screens/       # Screens (containers)
│   │   ├── components/    # UI Components
│   │   ├── hooks/         # Custom hooks
│   │   └── theme/         # Theme and styles
│   └── shared/            # 🔗 Cross-cutting concerns
│       ├── types/         # Shared types
│       ├── utils/         # Pure utilities
│       └── constants/     # Constants
└── assets/                # Images, fonts, etc
```

## 📋 Architecture Rules

### Core Principles

1. **Domain never imports from other layers**
   - Contains only pure business logic
   - No external dependencies

2. **Data implements Domain interfaces**
   - Repositories implement interfaces defined in domain
   - Manages DTOs and conversions

3. **Infrastructure isolates external libraries**
   - Expo, React Native, third-party APIs
   - Provides adapters for data sources

4. **Presentation uses Use Cases, not Repositories**
   - Screens call use cases
   - Components are purely visual

5. **Manual Dependency Injection**
   - Via constructors and parameters
   - No DI frameworks

### Path Aliases

```typescript
@domain/*          → src/domain/*
@data/*            → src/data/*
@infrastructure/*  → src/infrastructure/*
@presentation/*    → src/presentation/*
@shared/*          → src/shared/*
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo Go (for testing on mobile)

### Installation

```bash
# Install dependencies
npm install

# Start the project
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📝 Usage Examples

### Creating a New Feature

#### 1. Define Entity (Domain)

```typescript
// src/domain/entities/Product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

#### 2. Define Repository Interface (Domain)

```typescript
// src/domain/repositories/IProductRepository.ts
import { Product } from "@domain/entities/Product";

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}
```

#### 3. Create Use Case (Domain)

```typescript
// src/domain/use-cases/GetProductByIdUseCase.ts
import { Product } from "@domain/entities/Product";
import { IProductRepository } from "@domain/repositories/IProductRepository";

export class GetProductByIdUseCase {
  constructor(private readonly repository: IProductRepository) {}

  async execute(productId: string): Promise<Product | null> {
    if (!productId) {
      throw new Error("Product ID is required");
    }
    return await this.repository.findById(productId);
  }
}
```

#### 4. Implement Repository (Data)

```typescript
// src/data/repositories/ProductRepository.ts
import { Product } from "@domain/entities/Product";
import { IProductRepository } from "@domain/repositories/IProductRepository";
import { HttpClient } from "@infrastructure/http/HttpClient";

export class ProductRepository implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findById(id: string): Promise<Product | null> {
    const response = await this.httpClient.get<Product>(`/products/${id}`);
    return response.data;
  }

  async findAll(): Promise<Product[]> {
    const response = await this.httpClient.get<Product[]>("/products");
    return response.data;
  }
}
```

#### 5. Use in Screen (Presentation)

```typescript
// src/presentation/screens/ProductDetailScreen.tsx
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { GetProductByIdUseCase } from '@domain/use-cases/GetProductByIdUseCase';
import { ProductRepository } from '@data/repositories/ProductRepository';
import { HttpClient } from '@infrastructure/http/HttpClient';

export function ProductDetailScreen({ productId }: Props) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      // Dependency Injection manual
      const httpClient = new HttpClient({ baseURL: 'https://api.example.com' });
      const repository = new ProductRepository(httpClient);
      const useCase = new GetProductByIdUseCase(repository);

      const data = await useCase.execute(productId);
      setProduct(data);
      setLoading(false);
    };

    loadProduct();
  }, [productId]);

  if (loading) return <Text>Loading...</Text>;
  if (!product) return <Text>Product not found</Text>;

  return (
    <View>
      <Text>{product.name}</Text>
      <Text>${product.price}</Text>
    </View>
  );
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📚 Additional Documentation

- [Clean Architecture Rule](.cursor/rules/clean-architecture.md) - Detailed project rules
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6
- **UI**: React Native 0.81
- **Architecture**: Clean Architecture

## 📄 License

Private
