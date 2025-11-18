# QORIBET Mobile - React Native App

This is the React Native version of the QORIBET football betting platform, built with Expo and NativeWind (Tailwind CSS for React Native).

## Features

- 🎨 Beautiful UI with NativeWind (Tailwind CSS)
- 📱 Cross-platform support (iOS, Android, Web)
- ⚡ Fast development with Expo
- 🏈 Football betting interface
- 💰 Bet slip management
- 🔐 Authentication modal
- 🌍 Multiple league support (La Liga, Champions League, Bundesliga, etc.)

## Project Structure

```
qoribet-mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── components/            # React components
│   ├── ui/               # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── auth-modal.tsx    # Authentication modal
│   ├── bet-slip.tsx      # Bet slip component
│   ├── betting-content.tsx # Main betting content
│   ├── header.tsx        # App header
│   ├── league-filter.tsx # League filter
│   └── match-card.tsx    # Match card component
├── lib/                  # Utilities
│   └── utils.ts         # Utility functions
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- For iOS: macOS with Xcode
- For Android: Android Studio with SDK

## Installation

1. Navigate to the project directory:
```bash
cd qoribet-mobile
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:

**iOS (macOS only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

### Using Expo Go

1. Install Expo Go on your mobile device from the App Store or Google Play
2. Run `npm start`
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

## Key Technologies

- **Expo Router**: File-based routing for React Native
- **NativeWind**: Tailwind CSS for React Native
- **TypeScript**: Type-safe development
- **Expo Vector Icons**: Icon library (@expo/vector-icons)
- **React Hook Form**: Form management
- **Tailwind Merge**: Utility for merging Tailwind classes

## Main Components

### Header
Navigation header with logo, theme toggle, and authentication buttons.

### BettingContent
Main content area displaying matches filtered by league.

### MatchCard
Individual match display with betting odds (1, X, 2).

### BetSlip
Sidebar showing selected bets, stake input, and potential winnings.

### AuthModal
Modal for user login and registration.

### LeagueFilter
Horizontal scrollable filter for selecting leagues.

## Differences from Next.js Version

1. **UI Components**: Replaced Radix UI components with custom React Native components
2. **Styling**: Using NativeWind instead of regular Tailwind CSS
3. **Navigation**: Expo Router instead of Next.js App Router
4. **Icons**: Using @expo/vector-icons instead of lucide-react
5. **Modals**: Using React Native Modal instead of Radix Dialog
6. **Layout**: Using React Native components (View, Text, ScrollView, etc.)

## Development Notes

- The app uses NativeWind v4, which provides excellent Tailwind CSS support for React Native
- All components are TypeScript-first for better type safety
- The layout adapts to different screen sizes using flexbox
- Safe area handling is built-in with SafeAreaView

## Building for Production

### iOS:
```bash
eas build --platform ios
```

### Android:
```bash
eas build --platform android
```

Note: You'll need an Expo account and EAS CLI configured for production builds.

## Troubleshooting

### Metro bundler cache issues:
```bash
npx expo start --clear
```

### Dependency conflicts:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### NativeWind not working:
Make sure `global.css` is imported in `_layout.tsx` and babel.config.js includes the NativeWind preset.

## License

Private - QORIBET Football Betting Platform

## Support

For issues or questions, please contact the development team.
