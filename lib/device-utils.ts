import { Platform, Dimensions } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface LayoutConfig {
    matchCardColumns: number;
    betSlipPosition: 'sidebar' | 'bottom';
    headerStyle: 'expanded' | 'compact' | 'minimal';
    cardSize: 'large' | 'medium' | 'small';
    spacing: number;
    fontSize: number;
    showBetHistorySummary: boolean;
    matchesPerPage: number;
}

export const getDeviceType = (): DeviceType => {
    const { width } = Dimensions.get('window');

    if (Platform.OS === 'web') {
        if (width >= 1024) return 'desktop';
        if (width >= 768) return 'tablet';
        return 'mobile';
    }

    // Native platforms (iOS/Android)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
        if (width >= 768) return 'tablet';
        return 'mobile';
    }

    return 'mobile';
};

export const getLayoutConfig = (deviceType: DeviceType): LayoutConfig => {
    switch (deviceType) {
        case 'desktop':
            return {
                matchCardColumns: 1,
                betSlipPosition: 'sidebar',
                headerStyle: 'expanded',
                cardSize: 'large',
                spacing: 24,
                fontSize: 16,
                showBetHistorySummary: true,
                matchesPerPage: 5,
            };

        case 'tablet':
            return {
                matchCardColumns: 1,
                betSlipPosition: 'sidebar',
                headerStyle: 'compact',
                cardSize: 'medium',
                spacing: 16,
                fontSize: 15,
                showBetHistorySummary: true,
                matchesPerPage: 5,
            };

        case 'mobile':
            return {
                matchCardColumns: 1,
                betSlipPosition: 'bottom',
                headerStyle: 'minimal',
                cardSize: 'small',
                spacing: 12,
                fontSize: 14,
                showBetHistorySummary: true,
                matchesPerPage: 5,
            };
    }
};

/**
 * Hook to get current device type and layout config
 */
export const useDeviceLayout = () => {
    const deviceType = getDeviceType();
    const layout = getLayoutConfig(deviceType);

    return { deviceType, layout };
};
