# Thoryx Design System

Design system based on Stitch "thorix app" project, implemented with **NativeWind** (Tailwind CSS for React Native) for responsive design.

## 🎨 Color Palette

### Primary Colors

```typescript
primary: {
  main: '#135BEC',    // Main brand color
  light: '#4A7FEF',   // Lighter variant
  dark: '#0D42B0',    // Darker variant
}
```

### Background Colors

```typescript
background: {
  primary: '#0A1929',     // Main background (dark navy)
  secondary: '#132F4C',   // Secondary surfaces
  tertiary: '#1A2F45',    // Tertiary surfaces
}
```

### Text Colors

```typescript
text: {
  primary: '#FFFFFF',     // Primary text (white)
  secondary: '#B2BAC2',   // Secondary text (gray)
  tertiary: '#8B95A0',    // Tertiary text (light gray)
}
```

### Status Colors

```typescript
status: {
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
}
```

## 📏 Spacing Scale

```typescript
spacing: {
  xs: 4,      // Extra small
  sm: 8,      // Small
  md: 16,     // Medium
  lg: 24,     // Large
  xl: 32,     // Extra large
  xxl: 48,    // 2x Extra large
  xxxl: 64,   // 3x Extra large
}
```

## 🔲 Border Radius

```typescript
borderRadius: {
  sm: 4,      // Small radius
  md: 8,      // Medium radius
  lg: 12,     // Large radius
  xl: 16,     // Extra large radius
  xxl: 24,    // 2x Extra large radius
  full: 9999, // Fully rounded (circles)
}
```

## 📝 Typography

### Font Sizes

```typescript
fontSize: {
  xs: 12,       // Extra small
  sm: 14,       // Small
  md: 16,       // Medium (base)
  lg: 18,       // Large
  xl: 20,       // Extra large
  xxl: 24,      // 2x Extra large
  xxxl: 32,     // 3x Extra large
  display: 40,  // Display text
}
```

### Font Weights

```typescript
fontWeight: {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
}
```

### Line Heights

```typescript
lineHeight: {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
}
```

## 🎭 Components

### PinDot

Visual indicator for PIN entry progress.

**Props:**

- `filled: boolean` - Whether the dot is filled

**Usage:**

```typescript
<PinDot filled={true} />
```

### NumericKey

Individual key in the numeric keypad.

**Props:**

- `value: string` - The key value
- `onPress: (value: string) => void` - Callback when pressed
- `isBackspace?: boolean` - Whether this is the backspace key

**Usage:**

```typescript
<NumericKey value="1" onPress={handlePress} />
<NumericKey value="⌫" onPress={handleBackspace} isBackspace />
```

### NumericKeypad

Full numeric keypad (0-9 + backspace).

**Props:**

- `onKeyPress: (value: string) => void` - Callback for number keys
- `onBackspace: () => void` - Callback for backspace

**Usage:**

```typescript
<NumericKeypad
  onKeyPress={(value) => setPin(pin + value)}
  onBackspace={() => setPin(pin.slice(0, -1))}
/>
```

## 📱 Screens

### UnlockWalletScreen

PIN entry screen with biometric authentication option.

**Features:**

- 6-digit PIN entry
- Visual feedback with pin dots
- Numeric keypad
- FaceID/TouchID prompt
- Forgot PIN option
- Secure storage badge
- Lock icon with concentric circles

**Layout:**

- Dark background (#0A1929)
- Centered content
- Lock icon at top
- PIN dots in middle
- Numeric keypad at bottom
- Forgot PIN link at bottom

## 🎯 Design Principles

1. **Dark Theme First** - Primary design is dark mode
2. **Blue Accent** - #135BEC as primary interactive color
3. **Round Corners** - 8px default border radius
4. **Generous Spacing** - Minimum 16px between elements
5. **Clear Hierarchy** - Strong contrast between text levels
6. **Touch-Friendly** - Minimum 44x44pt touch targets
7. **Accessible** - High contrast ratios for readability

## 📐 Layout Guidelines

### Mobile (390px width)

- Padding: 32px horizontal
- Content max-width: 100%
- Keypad: 3 columns, centered
- Icon size: 200px outer circle

### Spacing Between Elements

- Icon to badge: 32px
- Badge to title: 24px
- Title to subtitle: 8px
- Subtitle to PIN dots: 32px
- PIN dots to keypad: 48px
- Keypad to forgot link: 32px

## 🔐 Security UI Patterns

### Secure Storage Badge

- Small badge with lock icon
- "SECURE STORAGE" text in caps
- Blue background with low opacity
- Positioned above main title

### PIN Entry Feedback

- 6 dots representing PIN length
- Filled dots use primary blue
- Empty dots show border only
- Smooth fill animation (future)

### Biometric Prompt

- Subtitle mentions "FaceID or PIN"
- Icon suggests security
- Clear call to action

## 🎨 Usage in Code

### Using NativeWind (Recommended)

NativeWind provides responsive design with Tailwind CSS classes:

```tsx
import { View, Text } from 'react-native';

// Responsive sizing with md: breakpoint (768px+)
<View className="w-16 h-16 md:w-20 md:h-20">
  <Text className="text-2xl md:text-3xl font-semibold text-text-primary">
    Hello
  </Text>
</View>

// Colors from tailwind.config.js
<View className="bg-background-primary">
  <Text className="text-primary-main">Primary Text</Text>
</View>

// Spacing and Layout
<View className="flex-1 px-6 md:px-8 gap-4 items-center">
  {/* Content */}
</View>
```

### Using Design Tokens (Alternative)

```typescript
import { DesignTokens } from "@presentation/theme/design-tokens";

// Colors
backgroundColor: DesignTokens.colors.background.primary;
color: DesignTokens.colors.text.primary;

// Spacing
padding: DesignTokens.spacing.lg;
gap: DesignTokens.spacing.md;

// Border Radius
borderRadius: DesignTokens.borderRadius.md;

// Typography
fontSize: DesignTokens.typography.fontSize.lg;
fontWeight: DesignTokens.typography.fontWeight.semiBold;
```

### Responsive Breakpoints

- **Mobile**: < 768px (default)
- **Tablet/Desktop**: >= 768px (use `md:` prefix)

Example:

```tsx
// Small on mobile, large on tablet
<View className="w-32 md:w-48 h-32 md:h-48" />
```

## 📚 References

- Stitch Project: thorix app (1096855362347952239)
- Original Screen: Unlock Wallet Screen (bc76ff7158eb42ec94ace40f7502ebec)
- Theme: Dark mode, Inter font, 8px roundness
- Primary Color: #135BEC
