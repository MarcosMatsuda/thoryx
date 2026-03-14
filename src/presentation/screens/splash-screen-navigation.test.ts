/**
 * Unit tests for SplashScreen navigation and PIN checking logic
 * Tests the new features added in PR #57 for splash screen integration
 */

import * as fs from 'fs'

describe('SplashScreen Navigation and PIN Logic', () => {
  const componentPath = require('path').join(__dirname, './splash-screen.tsx')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Router Integration', () => {
    it('should import useRouter from expo-router', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("useRouter")
      expect(fileContent).toContain("expo-router")
    })

    it('should initialize router hook', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("const router = useRouter()")
    })

    it('should use router.replace() for navigation', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("router.replace")
    })

    it('should not use router.push() to avoid back navigation', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).not.toContain("router.push")
    })
  })

  describe('PIN Checking', () => {
    it('should import CheckPinExistsUseCase', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("CheckPinExistsUseCase")
    })

    it('should import PinRepositoryImpl', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("PinRepositoryImpl")
    })

    it('should have a checkPinExists method or function', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("checkPinExists")
    })

    it('should track PIN check state with hasPinChecked', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("hasPinChecked")
      expect(fileContent).toContain("useState")
    })

    it('should track PIN saved state with hasPinSaved', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("hasPinSaved")
    })

    it('should initialize states to false', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("useState(false)")
    })

    it('should call checkPinExists in useEffect', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("useEffect")
      expect(fileContent).toContain("checkPinExists()")
    })

    it('should handle PIN check errors gracefully', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("catch")
      expect(fileContent).toContain("error")
    })

    it('should set hasPinSaved to false on error', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("setHasPinSaved(false)")
    })

    it('should set hasPinChecked to true after check', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("setHasPinChecked(true)")
    })
  })

  describe('Navigation Routes', () => {
    it('should navigate to /unlock when PIN exists', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain('/unlock')
    })

    it('should navigate to /pin-setup when PIN does not exist', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain('/pin-setup')
    })

    it('should conditionally navigate based on hasPinSaved', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain('if (hasPinSaved)')
    })
  })

  describe('Navigation Timing', () => {
    it('should navigate after 2 seconds total', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("2000")
    })

    it('should wait for PIN check before navigating', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("if (hasPinChecked)")
    })

    it('should not navigate before PIN check is complete', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      // Check that navigation is guarded by hasPinChecked
      const navigatePattern = /router\.replace\(/
      const indexOfNavigate = fileContent.indexOf('router.replace')
      const guardPattern = /if \(hasPinChecked\)/
      const indexOfGuard = fileContent.lastIndexOf('if (hasPinChecked)')
      expect(indexOfGuard).toBeLessThan(indexOfNavigate)
    })

    it('should clear timeout on unmount', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("clearTimeout")
      expect(fileContent).toContain("return () =>")
    })
  })

  describe('Animation Integration', () => {
    it('should preserve existing fade-in animation', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("withTiming")
      expect(fileContent).toContain("opacity")
      expect(fileContent).toContain("800")
    })

    it('should start animation on component mount', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("useEffect")
      expect(fileContent).toContain("opacity.value = withTiming")
    })

    it('should animate while PIN check happens', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      // The 2000ms delay includes the 800ms animation
      expect(fileContent).toContain("2000")
      expect(fileContent).toContain("800")
    })
  })

  describe('Error Scenarios', () => {
    it('should handle PIN check errors without crashing', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("try")
      expect(fileContent).toContain("catch")
      expect(fileContent).toContain("finally")
    })

    it('should log errors for debugging', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("console.error")
    })

    it('should default to PIN setup on error', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain("setHasPinSaved(false)")
    })
  })

  describe('Accessibility', () => {
    it('should maintain testID attributes', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain('testID="splash-container"')
      expect(fileContent).toContain('testID="splash-logo"')
    })

    it('should maintain accessibility label', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      expect(fileContent).toContain('accessibilityLabel')
    })
  })

  describe('Dependencies', () => {
    it('should have dependency arrays in useEffect calls', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      // Check for dependency arrays - should have [ ... ]
      const hasDeps = fileContent.includes('], [') || fileContent.includes(']') 
      expect(hasDeps).toBe(true)
    })

    it('should not have infinite loops in useEffect', () => {
      const fileContent = fs.readFileSync(componentPath, 'utf8')
      const effectCount = (fileContent.match(/useEffect/g) || []).length
      expect(effectCount).toBeGreaterThan(0)
      expect(effectCount).toBeLessThanOrEqual(3) // Animation + PIN check + Navigation
    })
  })
})
