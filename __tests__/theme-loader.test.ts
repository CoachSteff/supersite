/**
 * Tests for lib/theme-system/loader.ts
 *
 * Builds temporary theme directories in a workspace tmp dir, points
 * process.cwd() at them, and validates:
 *  - new optional files (typography.yaml, tokens.yaml, gradient.yaml,
 *    logo.yaml, page-types.yaml) are loaded when present
 *  - the legacy colors.yaml shape (typography/spacing/effects embedded)
 *    triggers a one-time deprecation warning
 *  - the deprecation warning is suppressed once the theme has migrated
 *    to dedicated typography.yaml / tokens.yaml files
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadTheme } from '@/lib/theme-system/loader';

const originalCwd = process.cwd();
let workspace: string;

function writeTheme(name: string, files: Record<string, string>) {
  const themeDir = path.join(workspace, 'themes', name);
  fs.mkdirSync(themeDir, { recursive: true });
  for (const [filename, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(themeDir, filename), contents);
  }
}

beforeEach(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'supersite-theme-test-'));
  process.chdir(workspace);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(workspace, { recursive: true, force: true });
  jest.restoreAllMocks();
});

describe('loadTheme — v0.5 optional files', () => {
  it('loads typography.yaml when present', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
      'typography.yaml': `
fontFamilies:
  display: "SF Compact"
  body: "Inter"
  mono: "JetBrains Mono"
baseFontSize: "16px"
scale:
  display-xl:
    size: "92px"
    lineHeight: 0.98
    weight: 300
    tracking: "-0.035em"
`,
    });

    const { theme, errors } = loadTheme('demo');
    expect(errors).toEqual([]);
    expect(theme.typography?.fontFamilies?.display).toBe('SF Compact');
    expect(theme.typography?.scale?.['display-xl']?.size).toBe('92px');
  });

  it('loads tokens.yaml with spacing, radius, and mode-aware shadows', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
      'tokens.yaml': `
spacing:
  "1": "4px"
  "8": "32px"
radius:
  sm: "4px"
  pill: "999px"
shadow:
  light:
    sm: "0 1px 2px rgba(0,0,0,0.06)"
  dark:
    sm: "0 1px 2px rgba(0,0,0,0.4)"
motion:
  duration: "220ms"
  easing: "cubic-bezier(0.2,0.8,0.2,1)"
`,
    });

    const { theme } = loadTheme('demo');
    expect(theme.tokens?.spacing?.['8']).toBe('32px');
    expect(theme.tokens?.radius?.pill).toBe('999px');
    expect(theme.tokens?.shadow?.light?.sm).toContain('rgba');
    expect(theme.tokens?.shadow?.dark?.sm).toContain('rgba');
    expect(theme.tokens?.motion?.duration).toBe('220ms');
  });

  it('loads gradient.yaml with light and dark variants', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
      'gradient.yaml': `
light:
  brand: "linear-gradient(15deg, #6A5ACD 0%, #00BFFF 100%)"
dark:
  brand: "linear-gradient(15deg, #2A1F66 0%, #003F5C 100%)"
`,
    });

    const { theme } = loadTheme('demo');
    expect(theme.gradient?.light?.brand).toContain('linear-gradient');
    expect(theme.gradient?.dark?.brand).toContain('linear-gradient');
  });

  it('loads page-types.yaml registry', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
      'page-types.yaml': `
default: default
types:
  default:
    hero: none
  home:
    hero: spectrum
`,
    });

    const { theme } = loadTheme('demo');
    expect(theme.pageTypes?.default).toBe('default');
    expect(theme.pageTypes?.types.home.hero).toBe('spectrum');
  });

  it('loads logo.yaml', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
      'logo.yaml': `
primary: "/assets/logo-white.svg"
mark: "/assets/mark.svg"
`,
    });

    const { theme } = loadTheme('demo');
    expect(theme.logo?.primary).toBe('/assets/logo-white.svg');
    expect(theme.logo?.mark).toBe('/assets/mark.svg');
  });

  it('returns undefined for optional files when they are absent', () => {
    writeTheme('demo', {
      'theme.yaml': 'name: "Demo"',
      'colors.yaml': `
name: "Demo"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
`,
    });

    const { theme } = loadTheme('demo');
    expect(theme.typography).toBeUndefined();
    expect(theme.tokens).toBeUndefined();
    expect(theme.gradient).toBeUndefined();
    expect(theme.logo).toBeUndefined();
    expect(theme.pageTypes).toBeUndefined();
  });
});

describe('loadTheme — legacy colors.yaml deprecation', () => {
  it('warns once when colors.yaml carries v0.4 typography/spacing block and no migrated files exist', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    writeTheme('legacy-demo', {
      'theme.yaml': 'name: "Legacy"',
      'colors.yaml': `
name: "Legacy"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
typography:
  fontFamily: "Inter"
spacing:
  md: "1rem"
effects:
  cardShadow: "subtle"
`,
    });

    loadTheme('legacy-demo');
    const deprecationCalls = warn.mock.calls.filter((args) =>
      String(args[0]).includes('deprecated and will be removed in v0.6')
    );
    expect(deprecationCalls.length).toBe(1);

    // Second load in same process should NOT warn again
    loadTheme('legacy-demo');
    const deprecationCallsAfter = warn.mock.calls.filter((args) =>
      String(args[0]).includes('deprecated and will be removed in v0.6')
    );
    expect(deprecationCallsAfter.length).toBe(1);
  });

  it('does NOT warn when the theme has migrated to typography.yaml / tokens.yaml', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    writeTheme('migrated-demo', {
      'theme.yaml': 'name: "Migrated"',
      'colors.yaml': `
name: "Migrated"
colors:
  light: { primary: "#000", secondary: "#000", text: "#000", textLight: "#000", background: "#fff", backgroundSecondary: "#fff", border: "#ccc", success: "#0a0", error: "#a00" }
  dark: { primary: "#fff", secondary: "#fff", text: "#fff", textLight: "#fff", background: "#000", backgroundSecondary: "#000", border: "#333", success: "#0f0", error: "#f00" }
typography:
  fontFamily: "Inter"
spacing:
  md: "1rem"
`,
      'typography.yaml': `
fontFamilies:
  body: "Inter"
`,
      'tokens.yaml': `
spacing:
  md: "1rem"
`,
    });

    loadTheme('migrated-demo');
    const deprecationCalls = warn.mock.calls.filter((args) =>
      String(args[0]).includes('deprecated and will be removed in v0.6')
    );
    expect(deprecationCalls.length).toBe(0);
  });
});
