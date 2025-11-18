import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useAuth } from "../contexts/AuthProvider";

export default function AuthModal({
    mode = "login",
    onClose,
}: {
    mode?: "login" | "register";
    onClose?: () => void;
}) {
    const { login, register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (mode === "login") {
                await login({ username: username || undefined, email: email || undefined, password });
            } else {
                await register({ username: username || undefined, email: email || undefined, password });
            }
            onClose?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e.message ?? "Auth failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, marginBottom: 8 }}>{mode === "login" ? "Sign in" : "Register"}</Text>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ marginBottom: 8 }} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 8 }} keyboardType="email-address" />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 8 }} />
            {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
            <Button title={loading ? "Please wait..." : mode === "login" ? "Sign in" : "Register"} onPress={onSubmit} disabled={loading} />
            <View style={{ height: 8 }} />
            <Button title="Close" onPress={() => onClose?.()} />
        </View>
    );
}