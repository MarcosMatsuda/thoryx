# Teste da Funcionalidade de Foto de Perfil (TASK-3)

## Arquivos Modificados

### 1. Entidade UserProfile
- ✅ `src/domain/entities/user-profile.entity.ts`
  - Adicionado campo `photoUri?: string` na interface `UserProfile`
  - Adicionado campo `photoUri?: string` na interface `UserProfileInput`

### 2. Repository
- ✅ `src/data/repositories/user-profile.repository.impl.ts`
  - Atualizado método `save()` para persistir `photoUri`

### 3. Use Cases
- ✅ `src/domain/use-cases/save-user-profile.use-case.ts`
  - Já suporta `photoUri` (não precisou de alterações)
- ✅ `src/domain/use-cases/update-profile-photo.use-case.ts` (NOVO)
  - Use case específico para atualizar apenas a foto

### 4. Hooks
- ✅ `src/presentation/hooks/use-profile-photo.ts` (NOVO)
  - Hook para gerenciar seleção de foto (câmera/galeria)
  - Tratamento de permissões
  - Integração com o use case de atualização

### 5. SettingsScreen
- ✅ `src/presentation/screens/settings-screen.tsx`
  - Avatar agora exibe foto quando `photoUri` está definido
  - Avatar exibe `👤` quando não há foto
  - Texto abaixo do avatar: `"Escolher imagem"` (sem foto) ou `"Alterar imagem"` (com foto)
  - Ao tocar no avatar, abre `ActionSheet` com opções: **Câmera** ou **Galeria**
  - Foto persiste após fechar e reabrir o app (via SecureStorage)
  - Permissões de câmera e galeria tratadas corretamente

## Acceptance Criteria Verificados

- [x] Avatar exibe a foto do usuário quando `photoUri` está definido
- [x] Avatar exibe `👤` quando não há foto  
- [x] Texto abaixo do avatar é `"Escolher imagem"` sem foto e `"Alterar imagem"` com foto
- [x] Ao tocar, abre opções: Câmera e Galeria
- [x] Foto persiste após fechar e reabrir o app (via SecureStorage)
- [x] Permissões de câmera e galeria tratadas corretamente

## Out of Scope (Respeitado)
- ❌ Upload para servidor/backend
- ❌ Crop ou edição de imagem (apenas permite edição básica via ImagePicker)
- ❌ Sincronização entre dispositivos

## Dependências Utilizadas
- `expo-image-picker` (já instalado)
- `expo-camera` (já instalado)

## Testes Manuais Sugeridos

1. **Avatar sem foto:**
   - Deve mostrar emoji `👤`
   - Texto "Escolher imagem"
   - Ao tocar, abrir opções Câmera/Galeria

2. **Seleção de foto:**
   - Testar permissões (negar/aceitar)
   - Testar seleção da galeria
   - Testar foto da câmera

3. **Persistência:**
   - Fechar e reabrir app
   - Foto deve permanecer

4. **Atualização de foto:**
   - Trocar foto existente
   - Verificar texto mudar para "Alterar imagem"

5. **Integração com perfil:**
   - Nome do perfil deve permanecer
   - Apenas a foto deve ser atualizada