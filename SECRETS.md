# Secrets & Environment Variables — Thoryx

This document outlines all secrets and environment variables needed for Thoryx development and deployment.

## Development Environment

### Local Development (.env.local)

Create a `.env.local` file in the root (never commit):

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api-staging.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# Logging
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_ENABLE_DEBUG=true

# Error Tracking (optional)
EXPO_PUBLIC_SENTRY_DSN=

# Analytics (optional)
EXPO_PUBLIC_ANALYTICS_TOKEN=
```

### Running Locally

```bash
npm install
npm start

# Scan QR code to open in Expo Go app
# Or: Press 'i' for iOS simulator, 'a' for Android emulator
```

## GitHub Actions Secrets

These are used in CI/CD workflows and configured in repository settings.

### Required Secrets

| Secret Name | Purpose | Example |
|-----------|---------|---------|
| `EAS_TOKEN` | Expo build authorization | `<token-from-expo>` |

### Optional Secrets

| Secret Name | Purpose | When Needed |
|-----------|---------|-----------|
| `SENTRY_DSN_PRODUCTION` | Production error tracking | If using Sentry |
| `APPLE_TEAM_ID` | Apple Developer Team ID | For iOS builds |
| `APPLE_KEY_ID` | App Store Connect API key ID | For automated iOS submit |
| `ANDROID_KEYSTORE_BASE64` | Android signing keystore (base64) | For automated Android builds |

## Expo-Specific Secrets

### EAS Token

Generate at https://expo.dev/accounts/[username]/settings/tokens:

1. Go to Expo website
2. Account Settings → Tokens
3. Create new token (name: `GitHub Actions` or similar)
4. Copy full token
5. Add to GitHub Actions as `EAS_TOKEN` secret

### iOS Provisioning (for production)

Required for submitting to App Store:
- Apple Developer account
- App ID in Apple Developer Portal
- Signing certificate
- Provisioning profile

Configure in EAS dashboard:
1. Go to project settings in Expo
2. iOS section
3. Upload certificate and provisioning profile

### Android Signing

Required for submitting to Google Play:
- Android keystore file (`.jks`)
- Keystore password
- Key alias
- Key password

Configure in `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "service-account.json"
      }
    }
  }
}
```

## Environment-Specific Configuration

### Development

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_ENABLE_DEBUG=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

### Staging

Configure in `eas.json`:

```json
{
  "build": {
    "staging": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.example.com",
        "EXPO_PUBLIC_ENVIRONMENT": "staging",
        "EXPO_PUBLIC_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Production

Configure in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.example.com",
        "EXPO_PUBLIC_ENVIRONMENT": "production",
        "EXPO_PUBLIC_LOG_LEVEL": "warn"
      }
    }
  }
}
```

## Secret Generation

### Generate Random Token

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Using dd
dd if=/dev/urandom bs=1 count=32 2>/dev/null | xxd -p
```

## GitHub Actions Configuration

### Setting Secrets

1. Go to repository Settings
2. Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `EAS_TOKEN`
5. Value: Paste token from Expo

### Using Secrets in Workflows

In `.github/workflows/deploy.yml`:

```yaml
env:
  EAS_TOKEN: ${{ secrets.EAS_TOKEN }}
```

## Expo Configuration Files

### app.json

Main Expo configuration:

```json
{
  "expo": {
    "name": "Thoryx",
    "slug": "thoryx",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png"
      }]
    ]
  }
}
```

### eas.json

EAS build configuration:

```json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": true,
      "android": true
    }
  }
}
```

## Security Best Practices

### DO ✅

- [ ] Store EAS_TOKEN as GitHub secret, never in code
- [ ] Rotate EAS token if exposed
- [ ] Use different tokens for development and production
- [ ] Keep keystore passwords secure
- [ ] Enable 2FA on Expo account
- [ ] Review permissions before each release
- [ ] Audit GitHub Actions access regularly

### DON'T ❌

- [ ] Commit `.env.local` file
- [ ] Share tokens via email/chat
- [ ] Use weak passwords for keystores
- [ ] Hardcode tokens in source code
- [ ] Commit keystore files to Git
- [ ] Reuse tokens across projects
- [ ] Expose tokens in build logs

## Troubleshooting

### "Unauthorized" Error in EAS Build

- Verify `EAS_TOKEN` is correct and not expired
- Regenerate token at https://expo.dev/accounts/[username]/settings/tokens
- Update GitHub Actions secret with new token

### "Invalid provisioning profile" (iOS)

- Check provisioning profile has not expired
- Renew in Apple Developer Portal
- Upload new profile in EAS dashboard

### "Keystore signature mismatch" (Android)

- Ensure same keystore used for all builds
- Verify keystore password is correct
- Cannot change keystore after first Play Store release

### Build hangs in GitHub Actions

- Check logs: `eas build:view`
- May need to increase GitHub Actions timeout
- Try manual build: `eas build --platform all --profile production`

## First-Time Setup

1. Create Expo account at https://expo.dev
2. Generate EAS token
3. Add `EAS_TOKEN` to GitHub Actions secrets
4. Create `eas.json` with build profiles
5. Test local build: `eas build --platform ios --profile preview --local`
6. Create app entries in App Store Connect and Google Play Console
7. Configure iOS signing in EAS dashboard
8. Set up Android keystore
9. Create first beta build: `eas build --platform all --profile preview`

