# Stitch Integration

This document tracks the integration of designs from Stitch into the Thoryx project.

## 📱 Imported Screens

### 1. Unlock Wallet Screen ✅

**Source**: Stitch project "thorix app" (1096855362347952239)
**Screen ID**: bc76ff7158eb42ec94ace40f7502ebec
**Status**: Implemented
**Route**: `/unlock`

**Components Created**:
- `src/presentation/screens/unlock-wallet-screen.tsx` - Main screen
- `src/presentation/components/pin-dot.tsx` - PIN indicator dot
- `src/presentation/components/numeric-key.tsx` - Single keypad key
- `src/presentation/components/numeric-keypad.tsx` - Full numeric keypad

**Design Tokens Created**:
- `src/presentation/theme/design-tokens.ts` - Complete design system

**Features**:
- 6-digit PIN entry
- Visual feedback with animated dots
- Numeric keypad (0-9 + backspace)
- Secure storage badge
- Lock icon with concentric circles
- Forgot PIN link
- Dark theme (#0A1929 background)
- Primary blue (#135BEC)

**Implementation Notes**:
- UI only (no authentication logic)
- Follows Clean Architecture (Presentation layer)
- Uses Design Tokens for consistency
- Reusable components for future screens

## 🎨 Design System

### Extracted from Stitch

**Theme**:
- Color Mode: Dark
- Font: Inter
- Roundness: 8px
- Primary Color: #135BEC
- Saturation: 3

**Tokens Created**:
- Colors (primary, background, text, status, ui)
- Spacing (xs to xxxl)
- Border Radius (sm to full)
- Typography (sizes, weights, line heights)
- Shadows (sm, md, lg)
- Animation (duration, easing)

## 📋 Available Stitch Screens

From project "thorix app":

1. ✅ **Unlock Wallet Screen** - Implemented
2. ⏳ **Wallet Home Screen** - Pending
3. ⏳ **Document Details Screen** - Pending
4. ⏳ **Add or Edit Document** - Pending (Favorite)
5. ⏳ **Wallet App Design System** - Pending
6. ⏳ **Wallet App Design System Guide** - Pending

## 🔄 Integration Workflow

### For Each New Screen:

1. **Fetch from Stitch**
   ```typescript
   CallMcpTool: get_screen
   - server: user-stitch
   - name: projects/{projectId}/screens/{screenId}
   ```

2. **Analyze Design**
   - Review screenshot
   - Identify reusable components
   - Extract new design tokens if needed

3. **Create Components**
   - Build reusable UI components
   - Place in `src/presentation/components/`
   - Use Design Tokens

4. **Create Screen**
   - Build screen in `src/presentation/screens/`
   - Compose components
   - Add route in `app/`

5. **Update Design System**
   - Add new tokens if needed
   - Document new components
   - Update this file

## 🛠️ Design Tokens Usage

```typescript
import { DesignTokens } from '@presentation/theme/design-tokens';

// Example usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.background.primary,
    padding: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.md,
  },
  text: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semiBold,
    color: DesignTokens.colors.text.primary,
  },
});
```

## 📦 Reusable Components

### Created Components

1. **PinDot** - PIN entry indicator
2. **NumericKey** - Single keypad button
3. **NumericKeypad** - Full numeric keypad (0-9 + backspace)

### Future Components (from Design System)

Based on Stitch screens, we'll need:
- Card components
- List items
- Action buttons
- Input fields
- Navigation components
- Tab bars
- Headers

## 🎯 Next Steps

1. Implement Wallet Home Screen
2. Create document list components
3. Build document detail view
4. Add navigation between screens
5. Implement document add/edit screen

## 📚 References

- [Design System Documentation](DESIGN_SYSTEM.md)
- [Stitch Project](https://stitch.google.com) - thorix app
- [Clean Architecture Rules](.cursor/rules/clean-architecture.md)
