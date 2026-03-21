import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { fetchTeacherVideoById } from "../../src/services/videoApi";

const openVideo = async (url) => {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
};

export default function VideoDetails() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchTeacherVideoById(id);
        setVideo(data);
      } catch {
        Alert.alert("Error", "Failed to load video details");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Video details not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Ionicons name="logo-youtube" size={36} color="#dc2626" />
        </View>
        <Text style={styles.title}>{video.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{video.targetBatch}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{video.description || "No description"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>YouTube URL</Text>
        <Text style={styles.url}>{video.url}</Text>
      </View>

      <TouchableOpacity style={styles.watchBtn} onPress={() => openVideo(video.url)}>
        <Ionicons name="logo-youtube" size={18} color="#fff" />
        <Text style={styles.watchBtnText}>Open on YouTube</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 28 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: 10, color: "#ef4444", fontWeight: "700" },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  badge: {
    marginTop: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { color: "#1d4ed8", fontWeight: "700" },

  section: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionLabel: {
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 6,
  },
  description: { color: "#334155", lineHeight: 20 },
  url: { color: "#0f172a" },

  watchBtn: {
    marginTop: 16,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  watchBtnText: { color: "#fff", fontWeight: "800" },
});
