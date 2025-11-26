import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Cache to avoid repeated API calls
let locationCache: {
    countryCode: string | null;
    timestamp: number;
    coordinates: { latitude: number; longitude: number } | null;
} | null = null;

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const PERU_COUNTRY_CODE = 'PE';

export interface LocationResult {
    isInPeru: boolean;
    countryCode: string | null;
    countryName: string | null;
    coordinates: { latitude: number; longitude: number } | null;
    error: string | null;
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getPermissionStatus(): Promise<PermissionStatus> {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status;
    } catch (error) {
        console.error('[LocationService] Failed to get permission status:', error);
        return 'undetermined';
    }
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status;
    } catch (error) {
        console.error('[LocationService] Permission request failed:', error);
        return 'denied';
    }
}

export async function getUserLocation(): Promise<{
    latitude: number;
    longitude: number;
} | null> {
    try {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 0,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('[LocationService] Failed to get location:', error);
        return null;
    }
}

export async function getCountryFromCoordinates(
    latitude: number,
    longitude: number
): Promise<{ countryCode: string | null; countryName: string | null }> {
    try {
        // Using Nominatim reverse geocoding API (free, no API key required)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'QoribetApp/1.0', // Nominatim requires a User-Agent
            },
        });

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        const countryCode = data.address?.country_code?.toUpperCase() || null;
        const countryName = data.address?.country || null;

        console.log('[LocationService] Reverse geocoding result:', {
            countryCode,
            countryName,
            coordinates: { latitude, longitude },
        });

        return { countryCode, countryName };
    } catch (error) {
        console.error('[LocationService] Reverse geocoding failed:', error);
        return { countryCode: null, countryName: null };
    }
}

function isCacheValid(): boolean {
    if (!locationCache) return false;
    const now = Date.now();
    return now - locationCache.timestamp < CACHE_DURATION;
}

export async function isUserInPeru(): Promise<LocationResult> {
    if (isCacheValid() && locationCache) {
        console.log('[LocationService] Using cached location');
        return {
            isInPeru: locationCache.countryCode === PERU_COUNTRY_CODE,
            countryCode: locationCache.countryCode,
            countryName: null, // Not cached
            coordinates: locationCache.coordinates,
            error: null,
        };
    }

    const status = await requestLocationPermission();
    if (status !== 'granted') {
        return {
            isInPeru: false,
            countryCode: null,
            countryName: null,
            coordinates: null,
            error: 'Location permission denied',
        };
    }

    const coordinates = await getUserLocation();
    if (!coordinates) {
        return {
            isInPeru: false,
            countryCode: null,
            countryName: null,
            coordinates: null,
            error: 'Failed to get location',
        };
    }

    const { countryCode, countryName } = await getCountryFromCoordinates(
        coordinates.latitude,
        coordinates.longitude
    );

    if (!countryCode) {
        return {
            isInPeru: false,
            countryCode: null,
            countryName: null,
            coordinates,
            error: 'Failed to determine country',
        };
    }

    locationCache = {
        countryCode,
        timestamp: Date.now(),
        coordinates,
    };

    return {
        isInPeru: countryCode === PERU_COUNTRY_CODE,
        countryCode,
        countryName,
        coordinates,
        error: null,
    };
}

export function clearLocationCache(): void {
    locationCache = null;
    console.log('[LocationService] Cache cleared');
}
export function getCachedLocation(): LocationResult | null {
    if (!isCacheValid() || !locationCache) {
        return null;
    }

    return {
        isInPeru: locationCache.countryCode === PERU_COUNTRY_CODE,
        countryCode: locationCache.countryCode,
        countryName: null,
        coordinates: locationCache.coordinates,
        error: null,
    };
}
