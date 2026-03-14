/**
 * Integration test for app/_layout.tsx (Root Layout)
 * Validates that the Root Layout properly initializes routes and prevents
 * navigation before the Root Layout finishes mounting (bug fix for issue #59)
 */

import * as fs from 'fs'
import * as path from 'path'

describe('Root Layout (app/_layout.tsx)', () => {
  const projectRoot = path.resolve(__dirname, '../..')
  const rootLayoutPath = path.join(projectRoot, 'app/_layout.tsx')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('File Structure', () => {
    it('should exist at app/_layout.tsx', () => {
      expect(fs.existsSync(rootLayoutPath)).toBe(true)
    })

    it('should be a TypeScript/TSX file', () => {
      const fileName = path.basename(rootLayoutPath)
      expect(fileName).toMatch(/\.tsx$/)
    })
  })

  describe('Theme Provider Setup', () => {
    it('should import ThemeProvider from @react-navigation/native', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('ThemeProvider')
      expect(fileContent).toContain('@react-navigation/native')
    })

    it('should import DarkTheme and DefaultTheme', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('DarkTheme')
      expect(fileContent).toContain('DefaultTheme')
    })

    it('should use useColorScheme hook', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('useColorScheme')
    })

    it('should apply theme based on color scheme', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('colorScheme === "dark" ? DarkTheme : DefaultTheme')
    })

    it('should wrap content in ThemeProvider', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('<ThemeProvider')
      expect(fileContent).toContain('</ThemeProvider>')
    })
  })

  describe('Route Configuration', () => {
    it('should import Stack from expo-router', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('Stack')
      expect(fileContent).toContain('from "expo-router"')
    })

    it('should define a Stack navigator', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('<Stack')
      expect(fileContent).toContain('</Stack>')
    })

    it('should define global screenOptions with headerShown false', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('screenOptions')
      expect(fileContent).toContain('headerShown: false')
    })

    it('should register index route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="index"')
    })

    it('should register splash route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="splash"')
    })

    it('should register unlock route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="unlock"')
    })

    it('should register pin-setup route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="pin-setup"')
    })

    it('should register (tabs) route group', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="(tabs)"')
    })

    it('should register home route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="home"')
    })

    it('should register emergency route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="emergency"')
    })

    it('should register emergency-setup route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="emergency-setup"')
    })

    it('should register add-credit-card route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="add-credit-card"')
    })

    it('should register document-details route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="document-details"')
    })

    it('should register add-document route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="add-document"')
    })

    it('should register select-documents route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="select-documents"')
    })

    it('should register profile-setup route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="profile-setup"')
    })

    it('should register change-pin route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="change-pin"')
    })

    it('should register modal route with modal presentation', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('name="modal"')
      expect(fileContent).toContain('presentation: "modal"')
    })
  })

  describe('Bug Fix for Issue #59 - Navigation Before Root Layout', () => {
    it('should set headerShown to false globally in screenOptions', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      // The fix ensures all routes don't show headers by default
      expect(fileContent).toContain('screenOptions')
      expect(fileContent).toContain('headerShown: false')
    })

    it('should explicitly set headerShown false on index route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const indexScreenMatch = fileContent.match(
        /name="index"[\s\S]*?options=\{[\s\S]*?headerShown:\s*false/
      )
      expect(indexScreenMatch).toBeTruthy()
    })

    it('should have all routes defined before index route navigates', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      // Stack definition should come before index route is used
      const stackPos = fileContent.indexOf('<Stack')
      const indexNamePos = fileContent.indexOf('name="index"')
      expect(stackPos).toBeLessThan(indexNamePos)
    })

    it('should not use unstable_settings anchor', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      // Old implementation with unstable_settings could cause race conditions
      expect(fileContent).not.toContain('unstable_settings')
      expect(fileContent).not.toContain("anchor: '(tabs)'")
    })
  })

  describe('Gesture and Navigation Behavior', () => {
    it('should disable gesture on (tabs) route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const tabsScreenMatch = fileContent.match(
        /name="\(tabs\)"[\s\S]*?options=\{[\s\S]*?gestureEnabled:\s*false/
      )
      expect(tabsScreenMatch).toBeTruthy()
    })

    it('should disable gesture on home route', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const homeScreenMatch = fileContent.match(
        /name="home"[\s\S]*?options=\{[\s\S]*?gestureEnabled:\s*false/
      )
      expect(homeScreenMatch).toBeTruthy()
    })
  })

  describe('Status Bar Configuration', () => {
    it('should import StatusBar from expo-status-bar', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('StatusBar')
      expect(fileContent).toContain('expo-status-bar')
    })

    it('should include StatusBar component', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('<StatusBar')
    })

    it('should set StatusBar style to light', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain("style=\"light\"")
      expect(fileContent).toContain('<StatusBar')
    })
  })

  describe('Imports and Dependencies', () => {
    it('should import reanimated for animations', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('react-native-reanimated')
    })

    it('should import global CSS', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain("../global.css")
      expect(fileContent).toContain("import")
    })

    it('should export RootLayout as default function', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('export default function RootLayout')
    })
  })

  describe('Rendering', () => {
    it('should render ThemeProvider as root component', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('return (')
      expect(fileContent).toContain('<ThemeProvider')
    })

    it('should render all routes within Stack', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      expect(fileContent).toContain('<Stack')
      expect(fileContent).toContain('<Stack.Screen')
      expect(fileContent).toContain('</Stack>')
    })

    it('should render StatusBar within ThemeProvider', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const themeProviderStart = fileContent.indexOf('<ThemeProvider')
      const themeProviderEnd = fileContent.indexOf('</ThemeProvider>')
      const statusBarPos = fileContent.indexOf('<StatusBar')
      expect(statusBarPos).toBeGreaterThan(themeProviderStart)
      expect(statusBarPos).toBeLessThan(themeProviderEnd)
    })
  })

  describe('Integration with Index Route', () => {
    it('should allow index route to safely navigate after root layout mounts', () => {
      const rootLayoutContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const indexRoutePath = path.join(projectRoot, 'app/index.tsx')
      const indexContent = fs.readFileSync(indexRoutePath, 'utf8')

      // Root layout should be fully defined with all routes
      expect(rootLayoutContent).toContain('<Stack.Screen')
      
      // Index route should check for rootNavigationState before navigating
      expect(indexContent).toContain('useRootNavigationState')
      expect(indexContent).toContain('rootNavigationState?.key')
    })
  })

  describe('Route Hierarchy and Ordering', () => {
    it('should define Stack before any Screen components', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const stackOpenPos = fileContent.indexOf('<Stack')
      const firstScreenPos = fileContent.indexOf('<Stack.Screen')
      expect(stackOpenPos).toBeLessThan(firstScreenPos)
    })

    it('should close Stack after all Screen definitions', () => {
      const fileContent = fs.readFileSync(rootLayoutPath, 'utf8')
      const lastScreenPos = fileContent.lastIndexOf('</Stack.Screen>')
      const stackClosePos = fileContent.indexOf('</Stack>')
      expect(lastScreenPos).toBeLessThan(stackClosePos)
    })
  })
})
