import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { router, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import API from "../src/services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Missing Fields", "Please enter email and password");
        return;
      }

      setLoading(true);

      const res = await API.post("/auth/login", { email, password });
      const data = res.data;

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("role", data.user.role);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Always reset the cached profile image to the current user's photo
      if (data.user.photo) {
        await AsyncStorage.setItem("profileImage", data.user.photo);
      } else {
        await AsyncStorage.removeItem("profileImage");
      }

      Alert.alert("Welcome 🎉", "Login successful");

      if (data.user.role === "teacher") {
        router.replace("/(teacher)/dashboard");
      } else {
        router.replace("/(student)/home");
      }
    } catch (error) {
      console.log("Login Error:", error);

      const message =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Invalid email or password";

      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ESDM</Text>
          <Text style={styles.subtitle}>
            Login to continue your journey
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="Email address"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <Link href="/register" style={styles.registerLink}>
            <Text style={styles.registerText}>
              Don’t have an account?{" "}
              <Text style={styles.registerBold}>Register</Text>
            </Text>
          </Link>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    padding: 20
  },

  header: {
    alignItems: "center",
    marginBottom: 30
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a"
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748b"
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#f8fafc"
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#0f172a"
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  },

  registerLink: {
    marginTop: 22
  },

  registerText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14
  },

  registerBold: {
    color: "#2563eb",
    fontWeight: "700"
  }
});
