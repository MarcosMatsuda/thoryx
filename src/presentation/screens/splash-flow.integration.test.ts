/**
 * Integration tests for the complete splash flow (PR #57)
 * Validates the entire initialization flow from app start to PIN-based routing
 */

import * as fs from 'fs'
import * as path from 'path'

describe('Splash Screen Flow Integration (PR #57)', () => {
  const projectRoot = path.resolve(__dirname, '../../..')
  const indexPath = path.join(projectRoot, 'app/index.tsx')
  const splashPath = path.join(projectRoot, 'app/splash.tsx')
  const pinSetupPath = path.join(projectRoot, 'app/pin-setup.tsx')
  const splashScreenPath = path.join(
    projectRoot,
    'src/presentation/screens/splash-screen.tsx'
  )
  const layoutPath = path.join(projectRoot, 'app/_layout.tsx')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Route Registration', () => {
    it('should have all required routes registered', () => {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      expect(layoutContent).toContain('name="index"')
      expect(layoutContent).toContain('name="splash"')
      expect(layoutContent).toContain('name="pin-setup"')
      expect(layoutContent).toContain('name="unlock"')
    })

    it('should register routes in correct order', () => {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      const indexPos = layoutContent.indexOf('name="index"')
      const splashPos = layoutContent.indexOf('name="splash"')
      const unlockPos = layoutContent.indexOf('name="unlock"')
      const pinSetupPos = layoutContent.indexOf('name="pin-setup"')

      expect(indexPos).toBeLessThan(splashPos)
      expect(splashPos).toBeLessThan(unlockPos)
      expect(unlockPos).toBeLessThan(pinSetupPos)
    })

    it('all routes should hide headers', () => {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      const headerShownCount = (layoutContent.match(/headerShown:\s*false/g) || [])
        .length
      expect(headerShownCount).toBeGreaterThan(0)
    })
  })

  describe('Index Route Entry Point', () => {
    it('should exist at app/index.tsx', () => {
      expect(fs.existsSync(indexPath)).toBe(true)
    })

    it('should render SplashScreen component inline', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('SplashScreen')
      expect(indexContent).toContain('return <SplashScreen />')
    })

    it('should check PIN existence and navigate after 2 seconds', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('PinRepositoryImpl')
      expect(indexContent).toContain('CheckPinExistsUseCase')
      expect(indexContent).toContain('setTimeout(() => setSplashDone(true), 2000)')
    })

    it('should use router.replace not router.push', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('replace')
      expect(indexContent).not.toContain('push')
    })

    it('should navigate to /unlock or /pin-setup based on PIN check', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain("router.replace(hasPinSaved ? '/unlock' : '/pin-setup')")
    })
  })

  describe('Splash Route File', () => {
    it('should exist at app/splash.tsx', () => {
      expect(fs.existsSync(splashPath)).toBe(true)
    })

    it('should render SplashScreen component', () => {
      const splashContent = fs.readFileSync(splashPath, 'utf8')
      expect(splashContent).toContain('SplashScreen')
    })

    it('should be a simple wrapper', () => {
      const splashContent = fs.readFileSync(splashPath, 'utf8')
      const lines = splashContent.trim().split('\n')
      expect(lines.length).toBeLessThanOrEqual(10)
    })
  })

  describe('SplashScreen Component Logic (Post-PR #62)', () => {
    it('should be a dumb component with no navigation logic', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      // Should NOT contain navigation or PIN check logic
      expect(screenContent).not.toContain('checkPinExists')
      expect(screenContent).not.toContain('CheckPinExistsUseCase')
      expect(screenContent).not.toContain('PinRepositoryImpl')
      expect(screenContent).not.toContain('hasPinChecked')
      expect(screenContent).not.toContain('hasPinSaved')
      expect(screenContent).not.toContain("'/unlock'")
      expect(screenContent).not.toContain("'/pin-setup'")
      expect(screenContent).not.toContain('router.replace')
      expect(screenContent).not.toContain('router.push')
      expect(screenContent).not.toContain('try')
      expect(screenContent).not.toContain('catch')
      expect(screenContent).not.toContain('finally')
      expect(screenContent).not.toContain('setHasPinSaved')
    })

    it('should only contain animation logic', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      // Should only contain animation-related code
      expect(screenContent).toContain('useSharedValue')
      expect(screenContent).toContain('withTiming')
      expect(screenContent).toContain('800')
      expect(screenContent).toContain('opacity')
      expect(screenContent).toContain('useAnimatedStyle')
      expect(screenContent).toContain('Easing.out(Easing.cubic)')
    })

    it('should render splash image with accessibility', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('Image')
      expect(screenContent).toContain('splash-icon.png')
      expect(screenContent).toContain('testID="splash-container"')
      expect(screenContent).toContain('testID="splash-logo"')
      expect(screenContent).toContain('accessibilityLabel')
    })
  })

  describe('Index Route Logic (Post-PR #62)', () => {
    it('should contain all navigation and PIN check logic', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      // Should contain all the logic that was removed from SplashScreen
      expect(indexContent).toContain('checkPin')
      expect(indexContent).toContain('CheckPinExistsUseCase')
      expect(indexContent).toContain('PinRepositoryImpl')
      expect(indexContent).toContain('hasPinSaved')
      expect(indexContent).toContain('splashDone')
      expect(indexContent).toContain("'/unlock'")
      expect(indexContent).toContain("'/pin-setup'")
      expect(indexContent).toContain('router.replace')
      expect(indexContent).toContain('2000')
      expect(indexContent).toContain('setTimeout')
    })

    it('should handle PIN check errors gracefully', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('try')
      expect(indexContent).toContain('catch')
      // No finally block needed since catch handles the error
    })

    it('should default to PIN setup on error', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('setHasPinSaved(false)')
    })

    it('should wait for both splash animation and PIN check', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('if (splashDone && hasPinSaved !== null)')
    })
  })

  describe('Pin Setup Route', () => {
    it('should exist at app/pin-setup.tsx', () => {
      expect(fs.existsSync(pinSetupPath)).toBe(true)
    })

    it('should render PinSetupScreen', () => {
      const pinSetupContent = fs.readFileSync(pinSetupPath, 'utf8')
      expect(pinSetupContent).toContain('PinSetupScreen')
    })

    it('should be reachable from index route', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain("'/pin-setup'")
    })
  })

  describe('Navigation Flow', () => {
    it('app.start -> index.tsx (renders SplashScreen inline) -> /unlock or /pin-setup', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('SplashScreen')
      expect(indexContent).toContain("'/unlock'")
      expect(indexContent).toContain("'/pin-setup'")
    })

    it('index -> /unlock if PIN exists', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain("'/unlock'")
      expect(indexContent).toContain('hasPinSaved ?')
    })

    it('index -> /pin-setup if PIN does not exist', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain("'/pin-setup'")
    })

    it('both navigation paths use router.replace to reset stack', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      const replaceCount = (indexContent.match(/router\.replace/g) || []).length
      expect(replaceCount).toBe(1) // Single router.replace with ternary for both paths
      expect(indexContent).toContain("hasPinSaved ? '/unlock' : '/pin-setup'")
    })
  })

  describe('Back Button Behavior', () => {
    it('should prevent back navigation from unlock screen', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('router.replace')
      // replace() resets stack instead of push()
    })

    it('should prevent back navigation from pin-setup', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('router.replace')
    })

    it('layout may have gestureEnabled disabled for auth flow', () => {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      // Check if swipe-back is disabled for key routes
      expect(layoutContent).toContain('gestureEnabled')
    })
  })

  describe('Timing and Animation', () => {
    it('splash animation should be 800ms', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('duration: 800')
    })

    it('total splash display should be ~2 seconds', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('2000')
    })

    it('should complete PIN check before navigation', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('if (splashDone && hasPinSaved !== null)')
      expect(indexContent).toContain('setTimeout')
    })
  })

  describe('Error Handling', () => {
    it('CheckPinExistsUseCase should handle errors', () => {
      const useCasePath = path.join(
        projectRoot,
        'src/domain/use-cases/check-pin-exists.use-case.ts'
      )
      const useCaseContent = fs.readFileSync(useCasePath, 'utf8')
      expect(useCaseContent).toContain('try')
      expect(useCaseContent).toContain('catch')
    })

    it('should return false if PIN check fails', () => {
      const useCasePath = path.join(
        projectRoot,
        'src/domain/use-cases/check-pin-exists.use-case.ts'
      )
      const useCaseContent = fs.readFileSync(useCasePath, 'utf8')
      expect(useCaseContent).toContain('return false')
    })

    it('index should default to PIN setup on error', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('setHasPinSaved(false)')
    })
  })

  describe('Code Organization', () => {
    it('route files should be simple wrappers', () => {
      const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').length
      const splashLines = fs.readFileSync(splashPath, 'utf8').split('\n').length
      const pinSetupLines = fs.readFileSync(pinSetupPath, 'utf8').split('\n').length

      expect(indexLines).toBeLessThan(50) // Increased due to inline SplashScreen implementation and duplicate PIN check fix
      expect(splashLines).toBeLessThan(10)
      expect(pinSetupLines).toBeLessThan(10)
    })

    it('complex logic should be in index route, not splash screen', () => {
      const screenLines = fs.readFileSync(splashScreenPath, 'utf8').split('\n')
        .length
      const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').length
      // SplashScreen should be simple (dumb component)
      expect(screenLines).toBeLessThanOrEqual(40)
      // Index should contain the complex logic
      expect(indexLines).toBeGreaterThan(30)
    })

    it('use-case should be testable', () => {
      const useCasePath = path.join(
        projectRoot,
        'src/domain/use-cases/check-pin-exists.use-case.ts'
      )
      const useCaseContent = fs.readFileSync(useCasePath, 'utf8')
      expect(useCaseContent).toContain('constructor')
      expect(useCaseContent).toContain('execute')
    })
  })

  describe('Acceptance Criteria (PR #57)', () => {
    it('criterion: Toda abertura do app mostra a SplashScreen primeiro', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('SplashScreen')
      expect(indexContent).toContain('useEffect')
    })

    it('criterion: Após ~2s, transita automaticamente para o fluxo correto', () => {
      // After PR #62 fix, navigation logic is in app/index.tsx
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('2000')
      expect(indexContent).toContain('setTimeout')
      expect(indexContent).toContain('if (splashDone && hasPinSaved !== null)')
    })

    it('criterion: Stack resetado — back não volta para splash', () => {
      // After PR #62 fix, navigation logic is in app/index.tsx
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('router.replace')
      expect(indexContent).not.toContain('router.push')
    })

    it('criterion: Fluxo de PIN check continua funcionando normalmente', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      // After PR #62 fix, SplashScreen is a dumb component
      // PIN check logic is now in app/index.tsx
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('CheckPinExistsUseCase')
      expect(indexContent).toContain('hasPinSaved')
    })
  })

  describe('Files Modified/Created', () => {
    it('should have modified app/index.tsx', () => {
      expect(fs.existsSync(indexPath)).toBe(true)
    })

    it('should have created app/pin-setup.tsx', () => {
      expect(fs.existsSync(pinSetupPath)).toBe(true)
    })

    it('should have modified app/_layout.tsx to register pin-setup', () => {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      expect(layoutContent).toContain('name="pin-setup"')
    })

    it('should have updated src/presentation/screens/splash-screen.tsx', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      // After PR #62 fix, SplashScreen is a dumb component
      // Should NOT contain navigation or PIN check logic
      expect(screenContent).not.toContain('CheckPinExistsUseCase')
      expect(screenContent).not.toContain('useRouter')
      // Should only contain animation logic
      expect(screenContent).toContain('useSharedValue')
      expect(screenContent).toContain('withTiming')
    })
  })
})
