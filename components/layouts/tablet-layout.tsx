import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { spacing, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface TabletLayoutProps {
    children: React.ReactNode;
    contentContainerStyle?: ViewStyle;
}

export function TabletLayout({ children, contentContainerStyle }: TabletLayoutProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.contentWrapper}>
                    {children}
                </View>
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
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl, // More padding for tablet
        alignItems: 'center', // Center content
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 768, // Max width for tablet content
        gap: spacing.lg,
    },
});
