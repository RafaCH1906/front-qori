# Peru Geolocation Feature - Usage Guide

This guide explains how to use the Peru-only geolocation feature in your Qoribet app.

## Quick Start

### 1. Basic Usage with PeruOnlyGuard

Wrap any component that should only be available in Peru:

```tsx
import { PeruOnlyGuard } from '@/components/peru-only-guard';

export default function MyPeruOnlyFeature() {
  return (
    <PeruOnlyGuard>
      <YourFeatureComponent />
    </PeruOnlyGuard>
  );
}
```

### 2. Using the Hook

For more control, use the `usePeruOnly` hook:

```tsx
import { usePeruOnly } from '@/hooks/usePeruOnly';

export default function MyComponent() {
  const { isAvailable, isLoading, error, checkAgain } = usePeruOnly();

  if (isLoading) return <LoadingSpinner />;
  if (!isAvailable) return <NotAvailableMessage />;

  return <YourFeature />;
}
```

### 3. Access Location Context

For advanced use cases:

```tsx
import { useLocation } from '@/context/location-context';

export default function MyComponent() {
  const { isInPeru, locationData, checkLocation, clearCache } = useLocation();

  // Manual location check
  const handleCheck = async () => {
    await checkLocation();
  };

  return (
    <View>
      <Text>In Peru: {isInPeru ? 'Yes' : 'No'}</Text>
      <Text>Country: {locationData?.countryCode}</Text>
      <Button onPress={handleCheck}>Check Location</Button>
    </View>
  );
}
```

## Testing

### Test with Mock Locations

#### On Android Emulator:
1. Open Settings → Location
2. Enable "Developer options"
3. Go to "Select mock location app"
4. Use a GPS spoofing app to set Peru coordinates:
   - Lima: -12.0464, -77.0428
   - Cusco: -13.5319, -71.9675

#### On iOS Simulator:
1. Debug → Location → Custom Location
2. Enter Peru coordinates:
   - Latitude: -12.0464
   - Longitude: -77.0428

#### On Web:
1. Open DevTools (F12)
2. Go to Sensors tab
3. Set custom location to Peru coordinates

### Test Different Scenarios

```tsx
// Test permission denied
// Deny location permission when prompted

// Test non-Peru location
// Set coordinates to USA: 40.7128, -74.0060

// Test Peru location
// Set coordinates to Lima: -12.0464, -77.0428

// Test cache
// Check location once, then check again (should use cache)

// Test cache clear
const { clearCache } = useLocation();
clearCache(); // Force new location check
```

## Example: Shake Sensor Demo

Navigate to the shake sensor demo screen:

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/shake-sensor');
```

This demonstrates a complete Peru-only feature with:
- Location verification
- Sensor activation
- Error handling
- User feedback

## API Reference

### PeruOnlyGuard Props

```tsx
interface PeruOnlyGuardProps {
  children: React.ReactNode;
  loadingMessage?: string;
  deniedMessage?: string;
  showRetry?: boolean;
}
```

### usePeruOnly Return

```tsx
interface UsePeruOnlyResult {
  isAvailable: boolean;    // true if in Peru
  isLoading: boolean;      // checking location
  error: string | null;    // error message
  checkAgain: () => void;  // retry function
  countryCode: string | null; // detected country
}
```

### LocationContext

```tsx
interface LocationContextValue {
  isInPeru: boolean | null;
  isLoading: boolean;
  error: string | null;
  locationData: LocationResult | null;
  checkLocation: () => Promise<void>;
  clearCache: () => void;
}
```

## Privacy & Security

- ✅ Only country code is determined (not exact location)
- ✅ Location data is cached locally (not sent to server)
- ✅ User can deny permission
- ✅ Clear privacy messaging in permission modal
- ✅ Cache expires after 1 hour

## Troubleshooting

### Location always shows as denied
- Check app permissions in device settings
- Ensure location services are enabled
- Try clearing cache and checking again

### Reverse geocoding fails
- Check internet connection
- Nominatim API may be rate-limited (wait a moment)
- Check console for detailed error messages

### Sensor doesn't work on web
- Device motion sensors have limited support in browsers
- Use mobile app for full functionality
- Some browsers require HTTPS for sensor access
