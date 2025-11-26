import { useEffect, useState } from 'react';
import { useLocation } from '@/context/location-context';

interface UsePeruOnlyResult {
    isAvailable: boolean;
    isLoading: boolean;
    error: string | null;
    checkAgain: () => Promise<void>;
    countryCode: string | null;
}

export function usePeruOnly(autoCheck: boolean = true): UsePeruOnlyResult {
    const { isInPeru, isLoading, error, locationData, checkLocation } = useLocation();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (autoCheck && !hasChecked && !isLoading && isInPeru === null) {
            checkLocation();
            setHasChecked(true);
        }
    }, [autoCheck, hasChecked, isLoading, isInPeru, checkLocation]);

    const checkAgain = async () => {
        setHasChecked(false);
        await checkLocation();
        setHasChecked(true);
    };

    return {
        isAvailable: isInPeru === true,
        isLoading,
        error,
        checkAgain,
        countryCode: locationData?.countryCode || null,
    };
}
