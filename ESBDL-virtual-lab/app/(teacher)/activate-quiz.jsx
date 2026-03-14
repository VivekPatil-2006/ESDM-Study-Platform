import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchTeacherQuizzes } from "../../src/services/quizApi";
import API from "../../src/services/api";

export default function ActivateQuiz() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = async () => {
    try {
      const loadedQuizzes = await fetchTeacherQuizzes();
      setQuizzes(loadedQuizzes);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadQuizzes();
    }, [])
  );

  const openQuizDetails = (quizId) => {
    router.push({
      pathname: "/(teacher)/quiz-details",
      params: { quizId }
    });
  };

  const openTemplate = async () => {
    try {
      const templateUrl = `${API.defaults.baseURL}/quizzes/template`;
      await Linking.openURL(templateUrl);
    } catch {
      Alert.alert("Error", "Unable to open template link.");
    }
  };

  const renderQuizCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => openQuizDetails(item._id || item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.quizName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "Active" ? styles.activeBadge : styles.inactiveBadge
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "Active" ? styles.activeText : styles.inactiveText
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color="#475569" />
          <Text style={styles.metaText}>{item.targetBatch}</Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color="#475569" />
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Activate Quiz</Text>

          <TouchableOpacity style={styles.templateButton} onPress={openTemplate} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={16} color="#1d4ed8" />
            <Text style={styles.templateButtonText}>Template</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Open a quiz to review details and activate it for a batch.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={renderQuizCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={42} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No quizzes available</Text>
              <Text style={styles.emptyText}>
                Tap the plus button to create your first quiz.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push("/(teacher)/create-quiz")}
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
    paddingHorizontal: 18,
    paddingTop: 18
  },

  header: {
    marginBottom: 12
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20
  },

  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },

  templateButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  listContent: {
    paddingBottom: 100
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
    elevation: 4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },

  quizName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },

  description: {
    marginTop: 10,
    color: "#475569",
    fontSize: 14,
    lineHeight: 20
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },

  metaText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600"
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },

  activeBadge: {
    backgroundColor: "#dcfce7"
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2"
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800"
  },

  activeText: {
    color: "#15803d"
  },

  inactiveText: {
    color: "#b91c1c"
  },

  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 26,
    marginTop: 20,
    alignItems: "center"
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a"
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20
  },

  fab: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  }
});
