import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { spacing, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface MobileLayoutProps {
    children: React.ReactNode;
    contentContainerStyle?: ViewStyle;
}

export function MobileLayout({ children, contentContainerStyle }: MobileLayoutProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        gap: spacing.md,
    },
});
