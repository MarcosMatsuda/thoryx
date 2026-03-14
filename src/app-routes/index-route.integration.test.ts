/**
 * Integration test for app/index.tsx route
 * Validates that the index route correctly navigates to splash screen
 */

import * as fs from 'fs'
import * as path from 'path'

describe('Index Route (app/index.tsx)', () => {
  const projectRoot = path.resolve(__dirname, '../..')
  const indexRoutePath = path.join(projectRoot, 'app/index.tsx')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('File Structure', () => {
    it('should exist at app/index.tsx', () => {
      expect(fs.existsSync(indexRoutePath)).toBe(true)
    })

    it('should be a TypeScript/TSX file', () => {
      const fileName = path.basename(indexRoutePath)
      expect(fileName).toMatch(/\.tsx$/)
    })
  })

  describe('Imports', () => {
    it('should import useEffect from react', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('useEffect')
      expect(fileContent).toContain("from 'react'")
    })

    it('should import useRouter from expo-router', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('useRouter')
      expect(fileContent).toContain("from 'expo-router'")
    })
  })

  describe('Component Definition', () => {
    it('should export default function IndexScreen', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('export default function IndexScreen')
    })

    it('should call useRouter hook', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('const router = useRouter()')
    })
  })

  describe('Navigation Behavior', () => {
    it('should navigate to /splash immediately on mount', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain("router.replace('/splash')")
    })

    it('should use router.replace to reset navigation stack', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('router.replace')
      expect(fileContent).not.toContain('router.push')
    })

    it('should return null since it only navigates', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('return null')
    })
  })

  describe('useEffect Setup', () => {
    it('should use useEffect to navigate on mount', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('useEffect')
      expect(fileContent).toContain('() => {')
    })

    it('should have router in dependency array', () => {
      const fileContent = fs.readFileSync(indexRoutePath, 'utf8')
      expect(fileContent).toContain('[router]')
    })
  })
})
