import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { spacing, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface DesktopLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    contentContainerStyle?: ViewStyle;
}

export function DesktopLayout({ children, sidebar, contentContainerStyle }: DesktopLayoutProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.mainRow}>
                    {/* Main Content */}
                    <View style={styles.contentColumn}>
                        {children}
                    </View>

                    {/* Sidebar (Right) */}
                    {sidebar && (
                        <View style={styles.sidebarColumn}>
                            {sidebar}
                        </View>
                    )}
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
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl * 2,
        alignItems: 'center',
    },
    mainRow: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: 1400, // Max width for desktop content
        gap: spacing.xl,
        alignItems: 'flex-start',
    },
    contentColumn: {
        flex: 1,
        gap: spacing.lg,
    },
    sidebarColumn: {
        width: 350, // Fixed width sidebar
        gap: spacing.lg,
    },
});
