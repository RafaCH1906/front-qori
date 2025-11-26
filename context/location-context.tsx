import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isUserInPeru, clearLocationCache, LocationResult } from '@/lib/services/location-service';

interface LocationContextValue {
    isInPeru: boolean | null;
    isLoading: boolean;
    error: string | null;
    locationData: LocationResult | null;
    checkLocation: () => Promise<void>;
    clearCache: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

interface LocationProviderProps {
    children: React.ReactNode;
    checkOnMount?: boolean; // Whether to check location automatically on mount
}

export function LocationProvider({ children, checkOnMount = false }: LocationProviderProps) {
    const [isInPeru, setIsInPeru] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationData, setLocationData] = useState<LocationResult | null>(null);

    const checkLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            setIsInPeru(false);
            console.error('[LocationContext] Location check failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearCache = useCallback(() => {
        clearLocationCache();
        setIsInPeru(null);
        setLocationData(null);
        setError(null);
        console.log('[LocationContext] Cache and state cleared');
    }, []);

    useEffect(() => {
        if (checkOnMount) {
            checkLocation();
        }
    }, [checkOnMount, checkLocation]);

    const value: LocationContextValue = {
        isInPeru,
        isLoading,
        error,
        locationData,
        checkLocation,
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
