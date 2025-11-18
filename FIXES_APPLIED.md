# Fixes Applied to QORIBET Mobile

## Issue: MIME Type Error & Bundle Failure

### Original Error
```
Refused to execute script from 'http://localhost:8081/node_modules/expo-router/entry.bundle...'
because its MIME type ('application/json') is not executable

ERROR: Cannot find module 'babel-preset-expo'
```

## ✅ Solutions Applied

### 1. Missing Dependencies Installed

**babel-preset-expo**
```bash
npm install babel-preset-expo --save-dev --legacy-peer-deps
```
- Required for Expo to compile JSX and TypeScript
- Was missing from the initial project setup

**react-dom (correct version)**
```bash
npm install react-dom@19.1.0 --legacy-peer-deps
```
- Needed for Expo web support
- Version matched to Expo SDK 54 requirements

**react-native-screens (correct version)**
```bash
npm install react-native-screens@~4.16.0 --legacy-peer-deps
```
- Fixed version compatibility with Expo SDK 54

### 2. Babel Configuration Fixed

**File: `babel.config.js`**

**Before (Incorrect):**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**After (Correct):**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      "nativewind/babel"
    ],
  };
};
```

**Why:**
- Presets and plugins must be in array format
- NativeWind should be a plugin, not a preset
- The `jsxImportSource` option is now correctly configured in the preset

### 3. Metro Configuration Created

**File: `metro.config.js`**
```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add NativeWind support
config.resolver.assetExts.push("css");

module.exports = config;
```

**Why:** Helps Metro bundler properly handle CSS files from NativeWind.

### 4. Conflicting Template Files Removed

**Deleted:**
- `App.tsx` (conflicted with Expo Router)
- `index.ts` (conflicted with app/index.tsx)

**Why:** Expo Router uses the `app/` directory for routing. The old template files were causing entry point confusion.

### 5. Expo Router Entry Point Configuration

**Created index.js entry file:**
```javascript
import "expo-router/entry";
```

**Package.json main entry:**
```json
{
  "main": "index.js"
}
```

**Why:** Expo Router needs a proper entry point file that imports the router. The main field must point to this file, not directly to "expo-router/entry".

**Dependencies added:**
```json
{
  "dependencies": {
    "react-dom": "19.1.0",
    // ... other deps
  },
  "devDependencies": {
    "babel-preset-expo": "^54.0.7",
    // ... other dev deps
  }
}
```

## Current Working State

### ✅ All Systems Operational

1. **Metro Bundler**: Running successfully
2. **Babel Compilation**: No errors
3. **Expo Router**: Working correctly
4. **NativeWind**: Styles compiling
5. **TypeScript**: No compilation errors
6. **Dependencies**: All compatible versions installed

### How to Run

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Or specify port if 8081 is in use
npm start -- --port 8082

# Clear cache if needed
npx expo start --clear
```

## Why --legacy-peer-deps?

We use `--legacy-peer-deps` because:
- React 19.1.0 (required by Expo SDK 54)
- React-dom 19.2.0 (from expo-router)
- Minor version mismatch causes peer dependency warnings

This is a known compatibility issue and doesn't affect functionality. Using `--legacy-peer-deps` tells npm to ignore these warnings and install anyway.

## Testing Checklist

After applying these fixes:

- [x] Metro bundler starts without errors
- [x] Babel compiles JavaScript/TypeScript correctly
- [x] Expo Router recognizes app structure
- [x] NativeWind styles are applied
- [x] TypeScript compilation succeeds
- [x] App runs on Expo Go
- [x] Web version bundles correctly
- [x] No MIME type errors
- [x] No module not found errors

## Future Considerations

### Recommended Updates

Once Expo SDK 55+ is released, consider:
1. Updating to newer Expo SDK
2. Updating React to match exact versions
3. Removing `--legacy-peer-deps` if versions align

### Known Warnings (Safe to Ignore)

```
baseUrl is deprecated and will stop functioning in TypeScript 7.0
```
- This is a TypeScript warning
- Will not affect functionality until TS 7.0 (future release)
- Can be safely ignored for now

## Files Modified Summary

| File | Action | Purpose |
|------|--------|---------|
| `babel.config.js` | Modified | Fixed preset/plugin configuration |
| `metro.config.js` | Created | Added Metro bundler configuration |
| `package.json` | Modified | Added missing dependencies |
| `App.tsx` | Deleted | Removed conflicting template file |
| `index.ts` | Deleted | Removed conflicting template file |
| `TROUBLESHOOTING.md` | Created | Documentation for future issues |
| `QUICK_START.md` | Updated | Added note about --legacy-peer-deps |

## Success!

The app now runs successfully on:
- 📱 iOS (Expo Go or Simulator)
- 🤖 Android (Expo Go or Emulator)
- 🌐 Web (via Expo web)

All original features from the Next.js version have been preserved in the React Native migration.

---

**Last Updated:** November 17, 2025
**Status:** ✅ All Issues Resolved
