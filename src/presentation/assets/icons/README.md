# SVG Icon Library

Comprehensive SVG icon library for the Thoryx Wallet App design system.

## Icon Categories

### 1. Secure Wallet Home (Screen 3)

- `bell-notification.svg` - Bell notification icon
- `new-card-action.svg` - New card action icon
- `qr-scanner-centered.svg` - QR scanner centered icon
- `verified-id-rlid.svg` - Verified ID/RLID icon

### 2. Add or Edit Document (Screen 7)

- `camera-front-back-upload.svg` - Camera front/back upload icon
- `calendar-expiry-date.svg` - Calendar expiry date icon

### 3. Add Credit Card (Screen 13)

- `ocr-scan-card.svg` - OCR scan card icon
- `eye-password-toggle.svg` - Eye password toggle icon

### 4. Select Documents (Screen 17)

- `passport-book.svg` - Passport book icon
- `user-create-mods.svg` - User create/mods icon

### 5. Emergency Profile (Screens 25 & 29)

- `blood-drop-type.svg` - Blood drop type icon
- `phone-call-ice.svg` - Phone call ICE (In Case of Emergency) icon
- `pill-meds.svg` - Pill/meds icon
- `triangle-allergies.svg` - Triangle allergies warning icon

### 6. Security & Authentication

- `lock-unlock.svg` - Lock/unlock icon for wallet authentication
- `verified-shield.svg` - Verified shield icon for secure sharing

### 7. Document Management

- `add-doc.svg` - Add document icon

## Usage

```typescript
import { BellNotification, NewCardAction } from '@presentation/assets/icons';

// Use in your React Native component
<BellNotification width={24} height={24} color="#3B82F6" />
```

## Design System

All icons follow the Stitch design system:

- Stroke width: 2px
- ViewBox: 24x24
- Style: Outline/Line icons
- Color: Inherits from `stroke="currentColor"` or `fill="currentColor"`

## Notes

- Icons are optimized for React Native
- Use with `react-native-svg` library
- All icons support color customization via props
- Maintain consistent sizing across the app
