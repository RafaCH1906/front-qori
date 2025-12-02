import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/header";
import BettingContent from "@/components/betting-content";
import BetSlip from "@/components/bet-slip";
import AuthModal from "@/components/auth-modal";
import ForgotPasswordModal from "@/components/forgot-password-modal";
import LeaguesBar from "@/components/leagues-bar";
import { ShakeModal } from "@/components/shake-modal";
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
import { OnboardingStorage } from "@/lib/onboarding-storage";

import { useAuth } from "@/context/AuthProvider";
import { useBalance } from "@/context/balance-context";
import { useToast } from "@/context/toast-context";
import { placeBet, PlaceBetRequest } from "@/lib/api/bets";
import BetConfirmationModal from "@/components/bet-confirmation-modal";
import { getDeviceType } from "@/lib/platform-utils";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { TabletLayout } from "@/components/layouts/tablet-layout";
import { DesktopLayout } from "@/components/layouts/desktop-layout";
import UnifiedBetPanel from "@/components/unified-bet-panel";
import { PeruOnlyGuard } from "@/components/peru-only-guard";

const MOBILE_BET_SLIP_MAX_HEIGHT = 420;
const MOBILE_BET_SLIP_COLLAPSED_SPACE = 140;

function IndexScreen() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isBetSlipExpanded, setIsBetSlipExpanded] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [isShakeModalOpen, setIsShakeModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBet, setPendingBet] = useState<{ stake: number, bets: any[], useFreeBet?: boolean } | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { selectedBets, addBet, removeBet, clearBets } = useBetting();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { balance, refreshBalance } = useBalance();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const betSlipAnim = useRef(new Animated.Value(0)).current;

  const deviceType = getDeviceType(width);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (Platform.OS === 'web') return;

      const hasCompleted = await OnboardingStorage.hasCompletedOnboarding();
      if (!hasCompleted) {
        router.replace('/onboarding');
      }
    };
    checkOnboarding();
  }, []);

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
    if (!user) {
      handleAuthOpen("login");
      return;
    }
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

  const handlePlaceBet = async (stake: number, bets: any[], useFreeBet: boolean = false) => {
    if (!user) {
      showToast("Por favor, inicia sesión para realizar apuestas", "error");
      return;
    }
    setPendingBet({ stake, bets, useFreeBet });
    setShowConfirmation(true);
  };

  const confirmPlaceBet = async () => {
    if (!pendingBet || !user) return;

    setIsPlacingBet(true);
    try {
      const selections = pendingBet.bets.map(bet => ({
        optionId: bet.id,
        oddsTaken: bet.odds,
        matchId: bet.matchId,
      }));

      console.log('[BET DEBUG] Pending bets:', JSON.stringify(pendingBet.bets, null, 2));
      console.log('[BET DEBUG] Selections to send:', JSON.stringify(selections, null, 2));

      // For single bets, include matchId at bet level
      const matchId = pendingBet.bets.length === 1 ? pendingBet.bets[0].matchId : undefined;

      const request: PlaceBetRequest = {
        userId: user.id,
        totalStake: pendingBet.stake,
        selections,
        useFreeBet: pendingBet.useFreeBet,
        matchId, // Include matchId for single bets
      };

      console.log('[BET DEBUG] Full request:', JSON.stringify(request, null, 2));

      await placeBet(request);

      const betType = pendingBet.bets.length > 1 ? "combinada" : "simple";
      const totalOdds = pendingBet.bets.reduce((acc, bet) => acc * bet.odds, 1);
      const potentialWin = pendingBet.useFreeBet
        ? totalOdds * 10
        : pendingBet.stake * totalOdds;

      clearBets();
      setShowConfirmation(false);
      setPendingBet(null);

      console.log('[IndexScreen] Waiting for DB transaction to commit...');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[IndexScreen] Refreshing balance after bet...');
      await refreshBalance();

      showToast(
        `¡Apuesta ${betType} realizada con éxito! 🍀\n` +
        `Monto: ${pendingBet.useFreeBet ? "Apuesta Gratis" : `S/ ${pendingBet.stake.toFixed(2)}`} | ` +
        `Cuota: ${totalOdds.toFixed(2)} | ` +
        `Ganancia potencial: S/ ${potentialWin.toFixed(2)}`,
        "success"
      );

    } catch (error: any) {
      let errorMessage = "Error al realizar la apuesta. Por favor, intenta nuevamente.";

      console.error('[IndexScreen] BET ERROR - Full error object:', error);
      console.error('[IndexScreen] BET ERROR - Response:', error.response);
      console.error('[IndexScreen] BET ERROR - Response data:', error.response?.data);
      console.error('[IndexScreen] BET ERROR - Response status:', error.response?.status);

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = "Error de conexión. Verifica tu internet.";
        } else {
          errorMessage = error.message;
        }
      }

      showToast(errorMessage, "error");
      console.error('[IndexScreen] Failed to place bet:', error);
    } finally {
      setIsPlacingBet(false);
    }
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

  const renderContent = () => {
    const content = (
      <>
        <LeaguesBar
          selectedLeagueId={selectedLeague}
          onLeagueSelect={(league) => setSelectedLeague(league ? league.id : null)}
        />
        <BettingContent
          onAddBet={handleAddBet}
          onOpenMatch={handleOpenMatch}
          selectedLeague={selectedLeague}
        />
      </>
    );

    if (deviceType === 'desktop') {
      return (
        <DesktopLayout
          sidebar={
            <UnifiedBetPanel
              bets={selectedBets}
              onRemoveBet={handleRemoveBet}
              onPlaceBet={handlePlaceBet}
            />
          }
        >
          {content}
        </DesktopLayout>
      );
    }

    if (deviceType === 'tablet') {
      return (
        <TabletLayout>
          {content}
        </TabletLayout>
      );
    }

    // Mobile
    return (
      <MobileLayout
        contentContainerStyle={{
          paddingBottom: isBetSlipExpanded
            ? MOBILE_BET_SLIP_MAX_HEIGHT + expandedPortalBottom
            : MOBILE_BET_SLIP_COLLAPSED_SPACE + spacing.lg,
        }}
      >
        {content}
      </MobileLayout>
    );
  };

  return (
    // <PeruOnlyGuard
    //   loadingMessage="Verificando tu ubicación..."
    //   deniedMessage="QORIBET solo está disponible en Perú"
    //   showRetry={true}
    // >
    <>
      <SafeAreaView style={styles.safeArea}>
      <Header
        onLoginClick={() => handleAuthOpen("login")}
        onRegisterClick={() => handleAuthOpen("register")}
      />

      {renderContent()}

      {/* Mobile Bet Slip Bottom Drawer (Visible on Mobile and Tablet) */}
      {deviceType !== 'desktop' && (
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
                onPlaceBet={handlePlaceBet}
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
        onForgotPassword={() => {
          setIsAuthOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Shake Modal */}
      <ShakeModal
        visible={isShakeModalOpen}
        onClose={() => setIsShakeModalOpen(false)}
      />

      {/* Bet Confirmation Modal */}
      <BetConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmPlaceBet}
        bets={pendingBet?.bets || []}
        stake={pendingBet?.stake || 0}
        totalOdds={pendingBet?.bets.reduce((acc, bet) => acc * bet.odds, 1) || 0}
        potentialWinnings={
          pendingBet?.useFreeBet
            ? (pendingBet?.bets.reduce((acc, bet) => acc * bet.odds, 1) || 0) * 10
            : (pendingBet?.stake || 0) * (pendingBet?.bets.reduce((acc, bet) => acc * bet.odds, 1) || 0)
        }
        balance={balance}
        isLoading={isPlacingBet}
        useFreeBet={pendingBet?.useFreeBet}
      />

      {/* Floating Gift Button - Mobile Only */}
      {Platform.OS !== 'web' && deviceType === 'mobile' && (
        <TouchableOpacity
          style={[styles.floatingGiftButton, { backgroundColor: colors.primary.DEFAULT }]}
          onPress={() => setIsShakeModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.giftEmoji}>🎁</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
    </>
    // </PeruOnlyGuard>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    betSlipContainer: {
      width: '100%',
      maxHeight: "100%",
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
      zIndex: 100,
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
      flex: 1,
      maxHeight: MOBILE_BET_SLIP_MAX_HEIGHT - spacing.xs * 2,
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
    floatingGiftButton: {
      position: 'absolute',
      bottom: spacing.xl * 6,
      right: spacing.lg,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 8,
      zIndex: 100,
    },
    giftEmoji: {
      fontSize: 32,
    },
  });

export default IndexScreen;
