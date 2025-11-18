# Troubleshooting Guide - QORIBET Mobile

## Common Issues and Solutions

### 1. ✅ FIXED: MIME Type Error (application/json)

**Error:**
```
Refused to execute script from 'http://localhost:8081/...' because its MIME type ('application/json') is not executable
```

**Solution (Already Applied):**
- ✅ Installed `babel-preset-expo` package
- ✅ Installed `react-dom@19.1.0` for web support
- ✅ Fixed `babel.config.js` configuration
- ✅ Created `metro.config.js` for proper bundling
- ✅ Removed conflicting `App.tsx` and `index.ts` files

### 2. Port Already in Use

**Error:**
```
Port 8081 is being used by another process
```

**Solutions:**

**Option A: Use a different port**
```bash
npx expo start --port 8082
```

**Option B: Kill the process using the port**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

**Option C: Clear cache and restart**
```bash
npx expo start --clear
```

### 3. Module Not Found Errors

**Error:**
```
Cannot find module 'babel-preset-expo'
```

**Solution:**
```bash
npm install babel-preset-expo --save-dev --legacy-peer-deps
```

**For other missing modules:**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 4. Dependency Version Conflicts

**Error:**
```
The following packages should be updated for best compatibility
```

**Solution:**
Use the exact versions specified:
```bash
npm install react-dom@19.1.0 react-native-screens@~4.16.0 --legacy-peer-deps
```

### 5. NativeWind Not Working (Styles Not Applied)

**Symptoms:**
- No styling visible
- Tailwind classes not working

**Solutions:**

**Check 1: Verify babel.config.js**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
```

**Check 2: Verify global.css is imported**
In `app/_layout.tsx`:
```typescript
import "../global.css";
```

**Check 3: Clear cache**
```bash
npx expo start --clear
```

**Check 4: Verify tailwind.config.js**
```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // ...
};
```

### 6. TypeScript Errors

**Error:**
```
Cannot find name 'View' / 'Text' / etc.
```

**Solution:**
Make sure you're importing from React Native:
```typescript
import { View, Text, ScrollView } from "react-native";
```

**Error:**
```
Property 'className' does not exist on type...
```

**Solution:**
Ensure `nativewind-env.d.ts` exists:
```typescript
/// <reference types="nativewind/types" />
```

### 7. App Crashes on Startup

**Symptoms:**
- Red screen error
- App closes immediately

**Solutions:**

**Check 1: Review error message**
Most errors will show in the terminal or on the device

**Check 2: Common fixes**
```bash
# Clear Metro bundler cache
npx expo start --clear

# Clear watchman cache (Mac/Linux)
watchman watch-del-all

# Reset expo
npx expo start --clear --reset-cache
```

**Check 3: Check imports**
Make sure all imports use correct paths:
```typescript
// Correct
import Header from "@/components/header";

// Wrong
import Header from "../components/header";
```

### 8. QR Code Not Scanning

**Symptoms:**
- Can't scan QR code with Expo Go
- "Network error" when scanning

**Solutions:**

**Option 1: Use tunnel mode**
```bash
npx expo start --tunnel
```

**Option 2: Check network**
- Ensure phone and computer are on same WiFi
- Disable VPN if active
- Check firewall settings

**Option 3: Manual connection**
In Expo Go app, enter the URL manually:
```
exp://<your-computer-ip>:8081
```

### 9. Web Build Issues

**Error:**
```
Module not found or compilation errors in web
```

**Solutions:**

**Install web dependencies:**
```bash
npm install react-dom@19.1.0 --legacy-peer-deps
```

**Use web-specific start:**
```bash
npx expo start --web
```

### 10. Icons Not Showing

**Error:**
```
Unable to resolve module @expo/vector-icons
```

**Solution:**
```bash
npm install @expo/vector-icons --legacy-peer-deps
```

**Alternative: Use Ionicons directly**
```typescript
import { Ionicons } from "@expo/vector-icons";

<Ionicons name="moon" size={24} color="black" />
```

## Complete Reset (Nuclear Option)

If nothing else works, try a complete reset:

```bash
# 1. Stop all running processes
# Close Expo dev server (Ctrl+C)

# 2. Delete all caches and dependencies
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# 3. Reinstall
npm install --legacy-peer-deps

# 4. Start fresh
npx expo start --clear
```

## Recommended Development Setup

### For Best Experience:

1. **Use Expo Go for testing** (easiest)
   - Install from App Store / Google Play
   - Scan QR code to run app

2. **For Android Emulator:**
   - Install Android Studio
   - Set up an Android Virtual Device (AVD)
   - Run: `npm run android`

3. **For iOS Simulator (macOS only):**
   - Install Xcode from Mac App Store
   - Install Command Line Tools
   - Run: `npm run ios`

4. **For Web Development:**
   - Run: `npm run web`
   - Open in browser at http://localhost:8081

## Getting Help

### Check Logs

**Terminal logs:**
Look for error messages in the terminal where Expo is running

**Device logs:**
Shake device → "Show Element Inspector" or "Debug Remote JS"

**Browser console:**
For web, check browser DevTools console (F12)

### Resources

- Expo Documentation: https://docs.expo.dev
- NativeWind Documentation: https://www.nativewind.dev
- React Native Documentation: https://reactnative.dev
- Expo Router Documentation: https://expo.github.io/router

### Report Issues

If you find bugs specific to this project, check:
1. Is it a configuration issue? → Check this guide
2. Is it an Expo issue? → Search Expo GitHub issues
3. Is it a NativeWind issue? → Search NativeWind GitHub issues

## Version Compatibility

This project uses:
- Expo SDK: ~54.0
- React: 19.1.0
- React Native: 0.81.5
- NativeWind: ^4.2.1
- TypeScript: ~5.9.2

Make sure all dependencies align with these versions.

## Success Checklist

✅ All dependencies installed with `--legacy-peer-deps`
✅ `babel-preset-expo` in devDependencies
✅ `babel.config.js` has NativeWind plugin
✅ `global.css` imported in `_layout.tsx`
✅ Old `App.tsx` and `index.ts` removed
✅ Metro bundler cache cleared
✅ Expo dev server running without errors

---

**Still having issues?** Review the logs carefully - they usually point to the exact problem!
