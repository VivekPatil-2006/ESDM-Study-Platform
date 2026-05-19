import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await AsyncStorage.multiRemove(["token", "role", "user", "profileImage"]);
      router.replace("/login");
    };
    logout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});