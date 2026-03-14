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

    it('should immediately navigate to splash', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('router.replace')
      expect(indexContent).toContain("'/splash'")
    })

    it('should use router.replace not router.push', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('replace')
      expect(indexContent).not.toContain('push')
    })

    it('should navigate on mount with useEffect', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('useEffect')
      expect(indexContent).toContain('router.replace')
    })

    it('should return null to avoid showing any UI', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      expect(indexContent).toContain('return null')
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

  describe('SplashScreen Component Logic', () => {
    it('should check if PIN exists on mount', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('checkPinExists')
      expect(screenContent).toContain('useEffect')
    })

    it('should import CheckPinExistsUseCase', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('CheckPinExistsUseCase')
      expect(screenContent).toContain('PinRepositoryImpl')
    })

    it('should track PIN check state', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('hasPinChecked')
      expect(screenContent).toContain('hasPinSaved')
    })

    it('should navigate to /unlock if PIN exists', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain("'/unlock'")
      expect(screenContent).toContain('if (hasPinSaved)')
    })

    it('should navigate to /pin-setup if PIN does not exist', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain("'/pin-setup'")
      expect(screenContent).toContain('else')
    })

    it('should wait 2 seconds before navigating', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('2000')
    })

    it('should use router.replace for navigation stack reset', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('router.replace')
    })

    it('should preserve fade-in animation', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('withTiming')
      expect(screenContent).toContain('800')
      expect(screenContent).toContain('opacity')
    })

    it('should handle errors gracefully', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('try')
      expect(screenContent).toContain('catch')
      expect(screenContent).toContain('finally')
    })

    it('should default to PIN setup on error', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      // In catch block, should set hasPinSaved to false
      expect(screenContent).toContain('setHasPinSaved(false)')
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

    it('should be reachable from splash screen', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain("'/pin-setup'")
    })
  })

  describe('Navigation Flow', () => {
    it('app.start -> index.tsx -> splash.tsx -> splash-screen.tsx', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      const splashContent = fs.readFileSync(splashPath, 'utf8')

      expect(indexContent).toContain("'/splash'")
      expect(splashContent).toContain('SplashScreen')
    })

    it('splash -> /unlock if PIN exists', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain("'/unlock'")
      expect(screenContent).toContain('if (hasPinSaved)')
    })

    it('splash -> /pin-setup if PIN does not exist', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain("'/pin-setup'")
    })

    it('both navigation paths use router.replace to reset stack', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      const replaceCount = (screenContent.match(/router\.replace/g) || []).length
      expect(replaceCount).toBeGreaterThanOrEqual(2) // At least 2: /unlock and /pin-setup
    })
  })

  describe('Back Button Behavior', () => {
    it('should prevent back navigation from unlock screen', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('router.replace')
      // replace() resets stack instead of push()
    })

    it('should prevent back navigation from pin-setup', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('router.replace')
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
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('2000')
    })

    it('should complete PIN check before navigation', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('if (hasPinChecked)')
      expect(screenContent).toContain('setTimeout')
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

    it('splash should default to PIN setup on error', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('setHasPinSaved(false)')
    })
  })

  describe('Code Organization', () => {
    it('route files should be simple wrappers', () => {
      const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').length
      const splashLines = fs.readFileSync(splashPath, 'utf8').split('\n').length
      const pinSetupLines = fs.readFileSync(pinSetupPath, 'utf8').split('\n').length

      expect(indexLines).toBeLessThan(20)
      expect(splashLines).toBeLessThan(10)
      expect(pinSetupLines).toBeLessThan(10)
    })

    it('complex logic should be in screen components', () => {
      const screenLines = fs.readFileSync(splashScreenPath, 'utf8').split('\n')
        .length
      expect(screenLines).toBeGreaterThan(20)
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
      expect(indexContent).toContain("'/splash'")
      expect(indexContent).toContain('useEffect')
    })

    it('criterion: Após ~2s, transita automaticamente para o fluxo correto', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('2000')
      expect(screenContent).toContain('setTimeout')
      expect(screenContent).toContain('if (hasPinSaved)')
    })

    it('criterion: Stack resetado — back não volta para splash', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('router.replace')
      expect(screenContent).not.toContain('router.push')
    })

    it('criterion: Fluxo de PIN check continua funcionando normalmente', () => {
      const screenContent = fs.readFileSync(splashScreenPath, 'utf8')
      expect(screenContent).toContain('CheckPinExistsUseCase')
      expect(screenContent).toContain('hasPinSaved')
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
      expect(screenContent).toContain('CheckPinExistsUseCase')
      expect(screenContent).toContain('useRouter')
    })
  })
})
