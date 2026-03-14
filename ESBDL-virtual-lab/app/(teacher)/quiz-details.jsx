import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchTeacherQuizById,
  updateTeacherQuizStatus
} from "../../src/services/quizApi";

export default function QuizDetails() {
  const { quizId } = useLocalSearchParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const storedQuiz = await fetchTeacherQuizById(quizId);
        setQuiz(storedQuiz);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const handleStatusChange = async () => {
    if (!quiz) {
      return;
    }

    const nextStatus = quiz.status === "Active" ? "Inactive" : "Active";

    try {
      setUpdating(true);
      const updatedQuiz = await updateTeacherQuizStatus(quiz._id || quiz.id, nextStatus);
      setQuiz(updatedQuiz);
      Alert.alert("Success", `Quiz is now ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to update quiz status.";
      Alert.alert("Error", message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={44} color="#94a3b8" />
        <Text style={styles.emptyTitle}>Quiz not found</Text>
        <Text style={styles.emptyText}>
          The selected quiz could not be loaded.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.quizName}>{quiz.name}</Text>
        <Text style={styles.description}>{quiz.description}</Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow label="Quiz Name" value={quiz.name} />
        <DetailRow label="Quiz Description" value={quiz.description} multiline />
        <DetailRow label="Target Batch" value={quiz.targetBatch} />
        <DetailRow label="Duration" value={quiz.duration} />
        <DetailRow label="Status" value={quiz.status} highlight />
        <DetailRow label="Excel File" value={quiz.fileName || "No file attached"} />

        <TouchableOpacity
          style={[
            styles.button,
            quiz.status === "Active" ? styles.deactivateButton : styles.activateButton
          ]}
          onPress={handleStatusChange}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={quiz.status === "Active" ? "pause-circle-outline" : "play-circle-outline"}
                size={20}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {quiz.status === "Active" ? "Deactivate Quiz" : "Activate Quiz"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value, multiline, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          multiline && styles.multilineValue,
          highlight && value === "Active" ? styles.activeValue : null,
          highlight && value !== "Active" ? styles.inactiveValue : null
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  content: {
    padding: 18,
    paddingBottom: 30
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc"
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },

  emptyText: {
    marginTop: 8,
    color: "#64748b",
    textAlign: "center"
  },

  heroCard: {
    backgroundColor: "#1d4ed8",
    borderRadius: 22,
    padding: 22
  },

  quizName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff"
  },

  description: {
    marginTop: 10,
    color: "#dbeafe",
    lineHeight: 22,
    fontSize: 14
  },

  detailsCard: {
    marginTop: 18,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    elevation: 4
  },

  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },

  value: {
    marginTop: 6,
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600"
  },

  multilineValue: {
    lineHeight: 22
  },

  activeValue: {
    color: "#15803d"
  },

  inactiveValue: {
    color: "#b91c1c"
  },

  button: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  activateButton: {
    backgroundColor: "#2563eb"
  },

  deactivateButton: {
    backgroundColor: "#dc2626"
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800"
  }
});