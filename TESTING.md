# TESTING.md - Checklist de Validação de UI/UX

**Objetivo:** Validar se todas as telas atendem aos requisitos, trackear features e tasks de UI.

**Status:** 🟡 Em desenvolvimento  
**Última atualização:** 2026-03-10

---

## 📱 **Telas do App**

### 🔐 **1. Tela de Unlock / Login**

- [x] **PIN Input:** 6 dígitos, máscara com dots
- [x] **Botão Face ID/Touch ID:** Só aparece se habilitado nas configurações
- [x] **Navegação após login:** Vai para tabs principais, não pode voltar
- [x] **Erro handling:** Feedback visual para PIN incorreto
- [x] **Biometria:** Funciona com Face ID / Touch ID / Fingerprint

### 🏠 **2. Tela Principal (Wallet)**

- [x] **Header:** Nome do usuário (não mais "Alex Rivera" mockado)
- [x] **Quick Actions:** 3 botões (Add Card, Emergency, Add Doc)
- [x] **Secure Sharing Mode:** Banner informativo com botão
- [x] **My Documents:** Lista de documentos com loading state
- [x] **My Cards:** Lista de cartões com loading state
- [x] **Empty states:** Mensagens quando não há documentos/cartões
- [x] **Navegação:** Clicar em documento → Document Details

### 📄 **3. Tela de Documents (Tab)**

- [ ] **Lista de documentos:** Grid ou lista
- [ ] **Empty state:** Mensagem quando não há documentos
- [ ] **Add button:** Navega para adicionar documento
- [ ] **Document details:** Clicar em documento → detalhes

### 🚨 **4. Tela de Emergency (Tab)**

- [x] **Emergency info display:** Mostra informações salvas
- [x] **Setup button:** Só aparece se usuário está logado
- [x] **Empty state:** Mensagem quando não há informações
- [x] **Navegação:** Botão "Add Emergency Info" → tela de setup

### ⚙️ **5. Tela de Settings (Tab)**

- [x] **User profile:** Mostra nome do usuário
- [x] **Biometric lock toggle:** Funcional, testa biometria antes de habilitar
- [x] **Auto-lock timeout:** Selector funcional
- [x] **Clear all data:** Funcional, remove tudo
- [x] **App info:** Versão, build number
- [x] **Links:** Terms of Service, Privacy Policy (placeholders)

### 💳 **6. Tela Add Credit Card**

- [ ] **Formulário:** Números do cartão, nome, validade, CVV
- [ ] **Validação:** Formato correto de cartão
- [ ] **OCR:** Opção de escanear cartão com câmera
- [ ] **Salvar:** Persiste no storage seguro

### 📄 **7. Tela Add Document**

- [ ] **Tipo de documento:** Selector (CNH, RG, Passaporte, etc.)
- [ ] **Fotos:** Upload front/back
- [ ] **Informações:** Número, emissão, validade
- [ ] **Salvar:** Persiste no storage

### 📄 **8. Tela Document Details**

- [x] **Fotos do documento:** Carousel
- [x] **Informações detalhadas:** Tabela de dados
- [x] **Botões de ação:** Edit, Share, Delete
- [x] **Navegação:** Edit → Add Document com dados pré-preenchidos

### 🚨 **9. Tela Emergency Details / Setup**

- [ ] **Informações médicas:** Tipo sanguíneo, alergias, medicações
- [ ] **Contatos de emergência:** Lista com nome, telefone, relação
- [ ] **Salvar:** Persiste no storage seguro
- [ ] **Acesso rápido:** Como será acessado em emergência?

### 👤 **10. Tela Profile Setup (Primeiro acesso)**

- [x] **Nome do usuário:** Input com validação
- [x] **Salvar:** Persiste no storage
- [x] **Navegação após salvar:** Vai para tabs principais

---

## 🎨 **Design System / UI Components**

### **Cores e Tokens**

- [x] **Primary colors:** Azul principal (#3B82F6)
- [x] **Text colors:** Primary, secondary, disabled
- [x] **Background colors:** Primary, secondary
- [x] **Status colors:** Success, error, warning

### **Componentes**

- [x] **ActionCard:** Ícone, label, variant (primary/danger/secondary)
- [x] **SettingsItem:** Label, ícone, switch/chevron, disabled state
- [x] **SettingsSection:** Header, items
- [x] **PinDot:** Para input de PIN
- [x] **NumericKeypad:** Teclado numérico
- [x] **SvgIcon:** Ícones SVG com tamanhos customizáveis
- [x] **DetailRow:** Para tabelas de detalhes
- [x] **DocumentPhotoCarousel:** Carousel de fotos
- [x] **ActionButtonLarge:** Botão grande de ação
- [x] **InfoBanner:** Banner informativo

---

## 🔒 **Funcionalidades de Segurança**

### **Autenticação**

- [x] **PIN:** 6 dígitos, armazenado seguro
- [x] **Biometria:** Face ID / Touch ID / Fingerprint
- [x] **Auto-lock:** Configurável (1, 5, 15, 30 minutos)
- [x] **Session management:** Não volta para login após autenticar

### **Armazenamento**

- [x] **MMKV + SecureStore:** Dados criptografados
- [x] **Separate storage instances:** Cartões, documentos, emergency, PIN, perfil
- [x] **Clear all data:** Remove tudo completamente

### **Criptografia**

- [ ] **Cartões:** Números criptografados
- [ ] **Documentos:** Fotos/info criptografadas
- [ ] **Emergency info:** Dados médicos criptografados

---

## 📱 **Navegação**

### **Bottom Tabs (4)**

- [x] **Wallet:** Tela principal
- [x] **Documents:** Lista de documentos
- [x] **Emergency:** Informações de emergência
- [x] **Settings:** Configurações

### **Stack Navigation**

- [x] **Unlock → Tabs:** Não pode voltar
- [x] **Profile Setup → Tabs:** Não pode voltar
- [x] **Tabs → Screens:** Navegação normal
- [x] **Gesture control:** Desabilitado para telas autenticadas

---

## 🧪 **Testes Manuais a Realizar**

### **Fluxo de Primeiro Acesso**

1. [ ] Abrir app pela primeira vez
2. [ ] Tela de Profile Setup aparece
3. [ ] Inserir nome → Salvar
4. [ ] É redirecionado para Unlock screen
5. [ ] Criar PIN (6 dígitos)
6. [ ] É redirecionado para Wallet (tabs)

### **Fluxo de Login Normal**

1. [ ] Abrir app (já com perfil)
2. [ ] Unlock screen aparece
3. [ ] Inserir PIN correto → Navega para tabs
4. [ ] PIN incorreto → Feedback de erro
5. [ ] Se biometria habilitada: Botão "Use Face ID" aparece
6. [ ] Clicar em Face ID → Prompt de biometria
7. [ ] Biometria sucesso → Navega para tabs

### **Fluxo de Configurações**

1. [ ] Ir para Settings tab
2. [ ] Habilitar biometria → Testar biometria → Sucesso
3. [ ] Desabilitar biometria → Confirmar
4. [ ] Mudar auto-lock timeout → Verificar persistência
5. [ ] Clear all data → Confirmar → Todos dados removidos

### **Fluxo de Documentos**

1. [ ] Ir para Documents tab
2. [ ] Empty state aparece (se não há documentos)
3. [ ] Add Document → Preencher formulário → Salvar
4. [ ] Document aparece na lista
5. [ ] Clicar em documento → Document Details
6. [ ] Edit document → Modificar → Salvar
7. [ ] Delete document → Confirmar → Remove da lista

---

## 🐛 **Bugs Conhecidos / A Resolver**

### **Críticos**

- [ ] **Bottom navigation:** Usuário reporta tabs erradas (verificar)
- [ ] **Face ID:** Loading rápido e some (corrigido na PR #12)
- [ ] **Emergency button:** Aparecendo sem login (corrigido)

### **Menores**

- [ ] **Ícone de celular centralizado:** Remover se existir
- [ ] **Terms/Privacy links:** Placeholders apenas
- [ ] **OCR de cartão:** Não implementado
- [ ] **Compartilhamento seguro:** Não implementado

---

## 🚀 **Features Pendentes**

### **Alta Prioridade**

- [ ] **Testes automatizados** (Jest + Testing Library)
- [ ] **Backup/restore** de dados
- [ ] **Compartilhamento seguro** de documentos
- [ ] **QR Code** para acesso rápido em emergência

### **Média Prioridade**

- [ ] **Modo offline** robusto
- [ ] **Sincronização em nuvem** (opcional)
- [ ] **Notificações** (lembretes de validade)
- [ ] **Temas** (claro/escuro)

### **Baixa Prioridade**

- [ ] **Estatísticas** de uso
- [ ] **Multi-idioma**
- [ ] **Customização de ícones**

---

## 📊 **Métricas de Qualidade**

### **Performance**

- [ ] **Tempo de carregamento inicial:** < 3s
- [ ] **Transições entre telas:** Suaves, sem lag
- [ ] **Uso de memória:** Estável, sem leaks

### **Acessibilidade**

- [ ] **VoiceOver:** Labels adequados
- [ ] **Contraste:** Texto legível
- [ ] **Tamanho de fonte:** Respeita configurações do sistema

### **Compatibilidade**

- [ ] **iOS:** 15.0+
- [ ] **Android:** 10.0+ (quando portado)
- [ ] **Tablets:** Layout responsivo

---

**Notas:**

- ✅ = Implementado e testado
- 🔄 = Em desenvolvimento
- ❌ = Não implementado
- [ ] = A testar/validar

**Atualizar este arquivo sempre que:**

1. Nova feature implementada
2. Bug corrigido
3. Teste realizado
4. Requisito alterado
