import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useFocusEffect } from "expo-router";

import { fetchStudentVideos } from "../../src/services/videoApi";

const openVideo = async (url) => {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
};

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVideos = async () => {
    try {
      const data = await fetchStudentVideos();
      setVideos(data);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to load video links";
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
        setRefreshing(true);
        loadVideos();
      }} />}
    >
      <Text style={styles.heading}>Video Lessons</Text>
      <Text style={styles.subheading}>Watch the YouTube videos shared by your teacher.</Text>

      {videos.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No videos available for your class yet.</Text>
        </View>
      ) : (
        videos.map((video) => (
          <View style={styles.videoCard} key={video._id}>
            <View style={styles.videoTopRow}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.batchBadge}>
                <Text style={styles.batchBadgeText}>{video.targetBatch}</Text>
              </View>
            </View>

            {!!video.description && <Text style={styles.videoDesc}>{video.description}</Text>}

            <Text numberOfLines={1} style={styles.videoUrl}>{video.url}</Text>

            <TouchableOpacity style={styles.watchBtn} onPress={() => openVideo(video.url)}>
              <Ionicons name="play-circle-outline" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>Watch Video</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
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
    marginBottom: 16,
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    color: "#64748b",
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  batchBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  batchBadgeText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 12,
  },
  videoDesc: {
    marginTop: 6,
    color: "#475569",
  },
  videoUrl: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 12,
  },
  watchBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  watchBtnText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
