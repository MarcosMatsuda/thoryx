# Screens

This folder contains the application screens (containers).

## Structure

Screens should:

- Use domain use cases for business logic
- Manage local UI state
- Compose presentation components
- Never directly access repositories or data sources

## Example

```typescript
import { useState, useEffect } from "react";
import { GetUserByIdUseCase } from "@domain/use-cases/GetUserByIdUseCase";
import { UserRepository } from "@data/repositories/UserRepository";

export function UserProfileScreen({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // Manual dependency injection
      const repository = new UserRepository(localDataSource);
      const useCase = new GetUserByIdUseCase(repository);

      const userData = await useCase.execute(userId);
      setUser(userData);
      setLoading(false);
    };

    loadUser();
  }, [userId]);

  // Render UI...
}
```
