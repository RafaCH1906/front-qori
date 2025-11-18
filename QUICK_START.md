# QORIBET Mobile - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd qoribet-mobile
npm install --legacy-peer-deps
```

> **Note:** We use `--legacy-peer-deps` to resolve React version conflicts.

### 2. Start the App
```bash
npm start
```

### 3. Run on Your Device

**Option A: Use Expo Go (Easiest)**
1. Install "Expo Go" app on your phone (iOS/Android)
2. Scan the QR code shown in terminal
3. App will load on your device

**Option B: Run on Simulator/Emulator**
```bash
# iOS (macOS only, requires Xcode)
npm run ios

# Android (requires Android Studio)
npm run android

# Web browser
npm run web
```

## 📱 What You'll See

- **Header**: QORIBET logo with Login/Register buttons
- **League Filter**: Horizontal scrollable list (La Liga, Liga 1 Max, Champions League, etc.)
- **Match Cards**: Football matches with betting odds (1, X, 2)
- **Bet Slip**: Right sidebar showing selected bets and potential winnings
- **Auth Modal**: Login/Register form when clicking authentication buttons

## 🎯 Try These Features

1. **Filter by League**: Tap a league button to see only those matches
2. **Place a Bet**: Tap any odds (1, X, or 2) on a match card
3. **Manage Bets**: See your bets in the right sidebar
4. **Set Stake**: Enter amount and use quick +5, +20, +50, +100 buttons
5. **View Winnings**: See potential winnings calculated automatically
6. **Login**: Click Login button to open authentication modal

## 🛠️ Troubleshooting

**Port already in use?**
```bash
npx expo start --port 8082
```

**App won't start?**
```bash
npx expo start --clear
```

**MIME type error (FIXED)**
This issue has been resolved! The following fixes were applied:
- ✅ Installed `babel-preset-expo`
- ✅ Fixed `babel.config.js`
- ✅ Removed old template files

**Can't scan QR code?**
- Make sure phone and computer are on same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`

**Dependency issues?**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**More help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 📂 Project Structure

```
qoribet-mobile/
├── app/                 # Screens
│   ├── _layout.tsx     # Root layout
│   └── index.tsx       # Home screen
├── components/         # UI components
│   ├── ui/            # Base components
│   ├── header.tsx     # Top navigation
│   ├── betting-content.tsx
│   ├── match-card.tsx
│   ├── bet-slip.tsx
│   └── auth-modal.tsx
└── lib/               # Utilities
    └── utils.ts
```

## 🎨 Key Technologies

- **Expo**: React Native framework
- **NativeWind**: Tailwind CSS for React Native
- **TypeScript**: Type safety
- **Expo Router**: File-based routing

## 📝 Development Tips

- Edit files and see changes instantly (Fast Refresh)
- Shake device to open developer menu
- Press `j` in terminal to open debugger
- Press `r` in terminal to reload app

## 🚢 Next Steps

- Customize colors in `tailwind.config.js`
- Add more leagues/matches in `components/betting-content.tsx`
- Connect to a real API (replace SAMPLE_MATCHES)
- Add user authentication backend
- Deploy with EAS Build

## 💡 Need Help?

- Check `README.md` for detailed documentation
- Review `MIGRATION_SUMMARY.md` to understand differences from Next.js version
- Expo docs: https://docs.expo.dev
- NativeWind docs: https://www.nativewind.dev

---

**Happy Coding! 🎉**
