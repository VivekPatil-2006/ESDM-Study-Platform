import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import API from "../src/services/api.js";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [secure, setSecure] = useState(true);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert("Missing Fields", "Please fill all details");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      Alert.alert("Success 🎉", "Account created successfully", [
        { text: "Login", onPress: () => router.replace("/login") }
      ]);
    } catch (error) {
      console.log("Register Error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.msg || "Registration failed"
      );
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join your college workspace
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            {["student", "teacher"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.roleBtn,
                  role === item && styles.activeRole
                ]}
                onPress={() => setRole(item)}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === item && styles.activeRoleText
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="Password"
              secureTextEntry={secure}
              style={styles.input}
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
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <Link href="/login" style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>Login</Text>
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
    fontSize: 30,
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

  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },

  roleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 8,
    backgroundColor: "#f8fafc"
  },

  activeRole: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb"
  },

  roleText: {
    fontWeight: "600",
    color: "#334155"
  },

  activeRoleText: {
    color: "#fff"
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
    backgroundColor: "#16a34a",
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

  loginLink: {
    marginTop: 22
  },

  loginText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14
  },

  loginBold: {
    color: "#2563eb",
    fontWeight: "700"
  }
});
