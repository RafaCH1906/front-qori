import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { isUserInPeru, clearLocationCache, LocationResult, getPermissionStatus, PermissionStatus, requestLocationPermission } from '@/lib/services/location-service';

interface LocationContextValue {
    isInPeru: boolean | null;
    isLoading: boolean;
    error: string | null;
    locationData: LocationResult | null;
    permissionStatus: PermissionStatus;
    checkLocation: () => Promise<void>;
    requestPermission: () => Promise<void>;
    clearCache: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

interface LocationProviderProps {
    children: React.ReactNode;
    checkOnMount?: boolean; // Whether to check location automatically on mount
}

export function LocationProvider({ children, checkOnMount = true }: LocationProviderProps) {
    const [isInPeru, setIsInPeru] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationData, setLocationData] = useState<LocationResult | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
    const isWeb = Platform.OS === 'web';

    const checkPermission = useCallback(async () => {
        if (isWeb) {
            setPermissionStatus('granted');
            return 'granted';
        }
        const status = await getPermissionStatus();
        setPermissionStatus(status);
        return status;
    }, [isWeb]);

    const checkLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (isWeb) {
            setPermissionStatus('granted');
            setIsInPeru(true);
            setLocationData(null);
            setIsLoading(false);
            return;
        }

        try {
            // First check/ensure permission
            let currentStatus = await getPermissionStatus();
            setPermissionStatus(currentStatus);

            if (currentStatus !== 'granted') {
                // If not granted, we can't check location. 
                // The UI should handle the 'denied' or 'undetermined' state.
                setIsInPeru(false);
                return;
            }

            const result = await isUserInPeru();

            setLocationData(result);
            setIsInPeru(result.isInPeru);

            if (result.error) {
                setError(result.error);
            }

            console.log('[LocationContext] Location check result:', {
                isInPeru: result.isInPeru,
                country: result.countryCode,
                error: result.error,
            });

            // Log warning if user is outside Peru
            if (!result.isInPeru && result.countryCode) {
                console.warn('[LocationContext] ⚠️ ACCESS ATTEMPT FROM OUTSIDE PERU:', {
                    country: result.countryCode,
                    coordinates: result.coordinates,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            setIsInPeru(false);
            console.error('[LocationContext] Location check failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isWeb]);

    const requestPermission = useCallback(async () => {
        if (isWeb) {
            setPermissionStatus('granted');
            await checkLocation();
            return;
        }

        const status = await requestLocationPermission();
        setPermissionStatus(status);
        if (status === 'granted') {
            checkLocation();
        }
    }, [checkLocation, isWeb]);

    const clearCache = useCallback(() => {
        clearLocationCache();
        setIsInPeru(null);
        setLocationData(null);
        setError(null);
        console.log('[LocationContext] Cache and state cleared');
    }, []);

    useEffect(() => {
        checkPermission();
        if (checkOnMount) {
            // We'll let the permission check drive the location check if needed, 
            // or just call checkLocation which handles permission check too.
            checkLocation();
        }
    }, [checkOnMount, checkLocation, checkPermission]);

    const value: LocationContextValue = {
        isInPeru,
        isLoading,
        error,
        locationData,
        permissionStatus,
        checkLocation,
        requestPermission,
        clearCache,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
