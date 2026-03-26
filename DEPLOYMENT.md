# Deployment Guide — Thoryx

This document covers the deployment and release process for Thoryx (React Native + Expo).

## Overview

- **Framework:** React Native + Expo
- **Distribution:** Expo EAS (Expo Application Services)
- **Platforms:** iOS + Android
- **Build System:** EAS Build
- **CI/CD:** GitHub Actions

## Prerequisites

### Accounts & Services Required

1. **Expo Account**
   - Sign up at https://expo.dev
   - Create organization (if not already done)
   - Recommended: Team plan for production apps

2. **Expo Application Services (EAS)**
   - Enable EAS Build in project
   - Configure build profiles for iOS and Android
   - Set up provisioning for iOS (certificates, provisioning profiles)

3. **GitHub Repository**
   - EAS secrets configured in GitHub Actions
   - Branch protection on `main` branch
   - Read access tokens for CI/CD

4. **App Store & Play Store** (for distribution)
   - Apple Developer account (for iOS releases)
   - Google Play Console account (for Android releases)

## Project Structure

```
thoryx/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Run tests, lint, type-check on PR
│       └── deploy.yml      # Build and deploy to production
├── eas.json                # EAS Build configuration
├── app.json                # Expo app configuration
├── package.json
└── src/
    └── ...                 # Application source code
```

## GitHub Actions Workflows

### CI Workflow (`ci.yml`)

Runs on every PR to `main` or `develop`:
- Security audit
- ESLint check
- TypeScript type checking
- Unit tests

### Deploy Workflow (`deploy.yml`)

Runs when merging to `main`:
1. Runs full test suite
2. Validates EAS configuration
3. Sets deployment ready status
4. (Manual trigger via EAS dashboard or CLI for actual build)

## Environment Variables

### Local Development

Create an `.env.local` file (never commit):

```env
# Expo
EXPO_PUBLIC_API_URL=https://api-staging.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# Analytics (optional)
EXPO_PUBLIC_SENTRY_DSN=

# Feature flags
EXPO_PUBLIC_ENABLE_DEBUG=true
```

### Staging Build

Environment variables in `eas.json` for staging profile:

```json
{
  "build": {
    "staging": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.example.com",
        "EXPO_PUBLIC_ENVIRONMENT": "staging"
      }
    }
  }
}
```

### Production Build

Environment variables in `eas.json` for production profile:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.example.com",
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  }
}
```

## Deployment Steps

### 1. Setup EAS Project

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize EAS in project
eas build:configure
```

### 2. Configure Build Profiles

Edit `eas.json`:

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
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "serviceAccount": "./.eas/service-account-key.json"
      }
    }
  }
}
```

### 3. Build APK/IPA

```bash
# Build for preview (internal distribution)
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Build for production (App Store / Play Store)
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 4. Submit to App Stores

```bash
# Android (Google Play)
eas submit --platform android --profile production

# iOS (Apple App Store)
eas submit --platform ios --profile production
```

## CI/CD Integration

### Setting Up Automated Builds

1. **GitHub Actions Secret**
   - Add `EAS_TOKEN` in GitHub Actions secrets
   - Generate token at https://expo.dev/accounts/[username]/settings/tokens

2. **Automated Trigger** (optional)
   - Modify `.github/workflows/deploy.yml` to trigger EAS builds
   - Use `eas build --platform all --profile production --non-interactive`

## Testing Before Deployment

### Local Testing

```bash
# Development build
npm start

# Simulate production build
eas build --platform ios --profile preview --local
eas build --platform android --profile preview --local
```

### Beta Testing

Use EAS' internal distribution:

```bash
# Build for beta testers
eas build --platform all --profile preview

# Distribute to beta group
# Use Expo dashboard to invite testers
```

## Versioning

Update version in `app.json` before release:

```json
{
  "expo": {
    "version": "1.0.0",
    "plugins": [
      ["expo-build-properties", {
        "android": {
          "compileSdkVersion": 34
        },
        "ios": {
          "deploymentTarget": "13.4"
        }
      }]
    ]
  }
}
```

## Rollback Procedures

### If Build Fails

1. Check EAS build logs:
   ```bash
   eas build:view
   ```

2. Fix the issue
3. Push to `main` branch
4. Next merge will trigger new build

### If App Crashes on Startup

1. Check device logs:
   ```bash
   eas logs
   ```

2. Revert bad commit
3. Rebuild and redeploy

## Monitoring & Observability

### Crash Reporting (Sentry)

```bash
# Install Sentry
npm install @sentry/react-native

# Configure in app
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
});
```

### Analytics

Use Expo Analytics or third-party:
- Segment
- Firebase Analytics
- Amplitude
- Mixpanel

## Security Checklist

- [ ] EAS account secured with 2FA
- [ ] EAS token stored as GitHub secret only
- [ ] iOS provisioning profiles up to date
- [ ] Android keystore password secured
- [ ] Release builds use correct signing certificates
- [ ] Environment variables don't contain secrets (use .env.local)
- [ ] App permissions reviewed before release
- [ ] Privacy policy updated for new permissions
- [ ] Terms of service in place

## First-Time Deployment Checklist

- [ ] Expo account created and team setup
- [ ] EAS project configured
- [ ] iOS provisioning completed (Developer Certificates, App IDs)
- [ ] Android signing keystore created
- [ ] Build profiles configured in `eas.json`
- [ ] Environment variables set for production
- [ ] EAS_TOKEN stored in GitHub Actions
- [ ] Beta version built and tested
- [ ] App Store Connect app created (iOS)
- [ ] Google Play Console app created (Android)
- [ ] Privacy policy and app description prepared
- [ ] First production build scheduled

## Support & Documentation

- Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- React Native: https://reactnative.dev/docs/getting-started

