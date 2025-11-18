import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/header";
import BettingContent from "@/components/betting-content";
import BetSlip from "@/components/bet-slip";
import AuthModal from "@/components/auth-modal";
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  ThemeColors,
} from "@/constants/theme";
import { Match } from "@/constants/matches";
import { useBetting } from "@/context/betting-context";
import { useTheme } from "@/context/theme-context";

const DESKTOP_BREAKPOINT = 900;
const MOBILE_BET_SLIP_MAX_HEIGHT = 420;
const MOBILE_BET_SLIP_COLLAPSED_SPACE = 140;

function IndexScreen() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isBetSlipExpanded, setIsBetSlipExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { selectedBets, addBet, removeBet } = useBetting();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const betSlipAnim = useRef(new Animated.Value(0)).current;
  const isLargeScreen = width >= DESKTOP_BREAKPOINT;

  const collapsedPortalBottom = spacing.md;
  const expandedPortalBottom = useMemo(() => {
    const desiredLift = spacing.lg * 2 + selectedBets.length * 18;
    const minLift = collapsedPortalBottom + spacing.lg * 2;
    const maxLift = MOBILE_BET_SLIP_MAX_HEIGHT - spacing.xl;
    return Math.min(maxLift, Math.max(desiredLift, minLift));
  }, [selectedBets.length, collapsedPortalBottom]);
  const handleAuthOpen = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAddBet = (bet: any) => {
    addBet(bet);
  };

  const handleRemoveBet = (id: number) => {
    removeBet(id);
  };

  const handleOpenMatch = (match: Match) => {
    router.push({
      pathname: "/match/[matchId]",
      params: { matchId: match.id.toString() },
    });
  };

  const toggleMobileBetSlip = () => {
    setIsBetSlipExpanded((prev) => !prev);
  };

  useEffect(() => {
    Animated.spring(betSlipAnim, {
      toValue: isBetSlipExpanded ? 1 : 0,
      useNativeDriver: false,
      damping: 18,
      stiffness: 160,
      mass: 0.9,
    }).start();
  }, [betSlipAnim, isBetSlipExpanded]);

  const portalBottom = betSlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [collapsedPortalBottom, expandedPortalBottom],
  });

  const sheetHeight = betSlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MOBILE_BET_SLIP_MAX_HEIGHT],
  });

  const sheetOpacity = betSlipAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.25, 1],
    extrapolate: "clamp",
  });

  const sheetTranslateY = betSlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
  });

  const toggleTranslateY = betSlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -spacing.sm],
  });

  const mobileContentPadding = isLargeScreen
    ? spacing.xl
    : isBetSlipExpanded
    ? MOBILE_BET_SLIP_MAX_HEIGHT + expandedPortalBottom
    : MOBILE_BET_SLIP_COLLAPSED_SPACE + spacing.lg;
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onLoginClick={() => handleAuthOpen("login")}
        onRegisterClick={() => handleAuthOpen("register")}
      />

      <View
        style={[
          styles.mainContainer,
          isLargeScreen ? styles.mainRow : styles.mainColumn,
        ]}
      >
        {/* Main Content - Scrollable */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={[
            styles.contentScrollContent,
            !isLargeScreen && {
              paddingBottom: mobileContentPadding,
            },
          ]}
        >
          <BettingContent
            onAddBet={handleAddBet}
            onOpenMatch={handleOpenMatch}
          />
        </ScrollView>

        {/* Bet Slip Sidebar - Fixed width on larger screens */}
        {isLargeScreen && (
          <View style={styles.betSlipContainer}>
            <BetSlip
              bets={selectedBets}
              onRemoveBet={handleRemoveBet}
              showHeader
            />
          </View>
        )}
      </View>

      {/* Mobile Bet Slip Bottom Drawer */}
      {!isLargeScreen && (
        <Animated.View
          style={[styles.mobileBetSlipPortal, { bottom: portalBottom }]}
        >
          <Animated.View
            pointerEvents={isBetSlipExpanded ? "auto" : "none"}
            style={[
              styles.mobileBetSlipSheet,
              {
                height: sheetHeight,
                opacity: sheetOpacity,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.mobileBetSlipInner}>
              <BetSlip
                bets={selectedBets}
                onRemoveBet={handleRemoveBet}
                showHeader={false}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.mobileToggleWrapper,
              { transform: [{ translateY: toggleTranslateY }] },
            ]}
          >
            <TouchableOpacity
              style={styles.mobileToggle}
              activeOpacity={0.85}
              onPress={toggleMobileBetSlip}
            >
              <View>
                <Text style={styles.mobileToggleLabel}>My Bets</Text>
                <Text style={styles.mobileToggleCount}>
                  {selectedBets.length} selected
                </Text>
              </View>
              <Ionicons
                name={isBetSlipExpanded ? "chevron-down" : "chevron-up"}
                size={20}
                color={colors.primary.foreground}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainRow: {
      flexDirection: "row",
      padding: spacing.lg,
      gap: spacing.lg,
    },
    mainColumn: {
      flexDirection: "column",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    contentScroll: {
      flex: 1,
    },
    contentScrollContent: {
      paddingBottom: spacing.xl,
    },
    betSlipContainer: {
      width: 320,
    },
    mobileBetSlipPortal: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
      alignItems: "stretch",
    },
    mobileBetSlipSheet: {
      marginBottom: spacing.sm,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      maxHeight: MOBILE_BET_SLIP_MAX_HEIGHT,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 8,
      overflow: "visible",
    },
    mobileBetSlipInner: {
      borderRadius: borderRadius.lg,
      overflow: "hidden",
    },
    mobileToggleWrapper: {
      width: "100%",
    },
    mobileToggle: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: 999,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    mobileToggleLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.primary.foreground,
    },
    mobileToggleCount: {
      fontSize: fontSize.xs,
      color: colors.primary.foreground,
    },
  });

export default IndexScreen;
