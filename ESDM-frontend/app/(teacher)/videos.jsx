import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  fetchTeacherVideos,
} from "../../src/services/videoApi";

export default function TeacherVideos() {
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVideos = async () => {
    try {
      const data = await fetchTeacherVideos();
      setVideos(data);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to load videos";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadVideos();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        contentContainerStyle={videos.length === 0 ? styles.emptyWrap : styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={() =>
              router.push({
                pathname: "/(teacher)/video-details",
                params: { id: item._id },
              })
            }
            activeOpacity={0.82}
          >
            <View style={styles.videoTopRow}>
              <View style={styles.iconBox}>
                <Ionicons name="logo-youtube" size={22} color="#dc2626" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.videoUrl} numberOfLines={1}>{item.url}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.targetBatch}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.heading}>YouTube Video Links</Text>
            <Text style={styles.subheading}>Tap a link to view full details.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="logo-youtube" size={52} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No video links yet</Text>
            <Text style={styles.emptyText}>Tap "+" to add your first link</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadVideos();
            }}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(teacher)/create-video")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 36 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subheading: {
    marginTop: 6,
    color: "#64748b",
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    color: "#64748b",
    marginTop: 6,
  },
  videoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  videoTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  videoUrl: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 12,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  badge: {
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
