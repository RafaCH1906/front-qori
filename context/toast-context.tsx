import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme-context";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<ToastType>("info");
    const [isVisible, setIsVisible] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    const showToast = useCallback((msg: string, t: ToastType = "info") => {
        setMessage(msg);
        setType(t);
        setIsVisible(true);

        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(3000),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
        });
    }, [opacity]);

    const getBackgroundColor = () => {
        switch (type) {
            case "success": return "#10B981"; // Emerald 500
            case "error": return "#EF4444"; // Red 500
            default: return "#3B82F6"; // Blue 500
        }
    };

    const getIconName = () => {
        switch (type) {
            case "success": return "checkmark-circle";
            case "error": return "alert-circle";
            default: return "information-circle";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isVisible && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        { opacity, backgroundColor: getBackgroundColor() },
                    ]}
                >
                    <Ionicons name={getIconName()} size={24} color="white" />
                    <Text style={styles.toastText}>{message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        top: Platform.OS === "ios" ? 60 : 40,
        right: 20,
        left: 20, // Optional: make it full width minus margins on mobile if preferred, but user asked for "upper right"
        // For strictly upper right on large screens, we can limit width.
        // Let's make it responsive:
        maxWidth: 400,
        alignSelf: "flex-end", // This pushes it to the right
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
        gap: 12,
    },
    toastText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
        flex: 1,
    },
});
