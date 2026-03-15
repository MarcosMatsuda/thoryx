# NativeWind Setup Guide

NativeWind brings Tailwind CSS to React Native, providing responsive design capabilities and utility-first styling.

## 📦 Installation

Already installed in this project:

```bash
npx expo install nativewind tailwindcss
```

## ⚙️ Configuration

### 1. Tailwind Config (`tailwind.config.js`)

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom colors from Design System
      },
    },
  },
};
```

### 2. Metro Config (`metro.config.js`)

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 3. Global CSS (`global.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Import in Root Layout (`app/_layout.tsx`)

```typescript
import "../global.css";
```

### 5. TypeScript Types (`nativewind-env.d.ts`)

```typescript
/// <reference types="nativewind/types" />
```

## 🎯 Usage Examples

### Basic Styling

```tsx
<View className="flex-1 bg-background-primary px-6 py-4">
  <Text className="text-2xl font-bold text-text-primary">Hello World</Text>
</View>
```

### Responsive Design

Use `md:` prefix for tablet/desktop (>= 768px):

```tsx
<View className="w-32 md:w-48 h-32 md:h-48">
  <Text className="text-lg md:text-2xl">Responsive</Text>
</View>
```

### Interactive States

```tsx
<Pressable className="px-4 py-2 bg-primary-main rounded-lg active:bg-primary-dark">
  <Text className="text-white font-semibold">Press Me</Text>
</Pressable>
```

### Conditional Classes

```tsx
<View
  className={`w-12 h-12 rounded-full ${filled ? "bg-primary-main" : "bg-transparent"}`}
/>
```

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet/Desktop**: `md:` prefix (>= 768px)

## 🎨 Custom Colors

All colors from `DesignTokens` are available in Tailwind:

```tsx
// Background
className = "bg-background-primary";
className = "bg-background-secondary";

// Text
className = "text-text-primary";
className = "text-text-secondary";

// Primary
className = "bg-primary-main";
className = "text-primary-light";

// Status
className = "text-status-success";
className = "bg-status-error";
```

## 🚀 Benefits

1. **Responsive Design**: Easy breakpoints with `md:` prefix
2. **Faster Development**: Utility classes instead of StyleSheet
3. **Consistency**: Design tokens enforced through Tailwind config
4. **Better DX**: IntelliSense for class names
5. **Smaller Bundle**: Purges unused styles

## 📝 Migration from StyleSheet

**Before (StyleSheet):**

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1628",
    paddingHorizontal: 24,
  },
});

<View style={styles.container} />;
```

**After (NativeWind):**

```tsx
<View className="flex-1 bg-background-primary px-6" />
```

## 🔗 Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
