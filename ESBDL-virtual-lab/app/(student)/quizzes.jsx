import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  fetchStudentActiveQuizzes,
  fetchStudentQuizResults
} from "../../src/services/quizApi";

export default function Quizzes() {
  const router = useRouter();
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuizDashboard = async () => {
    try {
      const [quizList, resultList] = await Promise.all([
        fetchStudentActiveQuizzes(),
        fetchStudentQuizResults()
      ]);

      setActiveQuizzes(quizList);
      setPreviousResults(resultList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadQuizDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadQuizDashboard();
  };

  const openQuiz = (quizId) => {
    router.push({
      pathname: "/(student)/take-quiz",
      params: { quizId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📝 Quizzes</Text>
      <Text style={styles.subheading}>
        Attend quizzes & track your performance
      </Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={previousResults}
          keyExtractor={(item) => String(item._id || item.quizId)}
          renderItem={({ item }) => <ResultCard result={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View>
              <Text style={styles.sectionTitle}>Active Quizzes</Text>
              {activeQuizzes.length === 0 ? (
                <EmptyCard
                  icon="time-outline"
                  title="No active quiz right now"
                  text="Once a teacher activates a quiz for your batch, it will appear here."
                />
              ) : (
                activeQuizzes.map((item) => (
                  <QuizCard key={item._id} quiz={item} onStart={openQuiz} />
                ))
              )}

              <Text style={styles.sectionTitle}>Previous Results</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyCard
              icon="bar-chart-outline"
              title="No quiz results yet"
              text="Submit your first quiz to see marks here."
            />
          }
        />
      )}
    </View>
  );
}

/* ================= QUIZ CARD ================= */

function QuizCard({ quiz, onStart }) {
  const isActive = quiz.status === "Active";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.quizTitle}>{quiz.name}</Text>
        <View
          style={[
            styles.statusBadge,
            isActive ? styles.active : styles.upcoming
          ]}
        >
          <Text style={styles.statusText}>{quiz.status}</Text>
        </View>
      </View>

      <Text style={styles.subject}>{quiz.description}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color="#64748b" />
        <Text style={styles.metaText}>{quiz.duration}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={14} color="#64748b" />
        <Text style={styles.metaText}>{quiz.targetBatch}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="help-outline" size={14} color="#64748b" />
        <Text style={styles.metaText}>{quiz.questionCount} Questions</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.startBtn,
          !isActive && styles.disabledBtn
        ]}
        disabled={!isActive}
        onPress={() => onStart(quiz._id)}
      >
        <Ionicons
          name="play-outline"
          size={18}
          color="#fff"
        />
        <Text style={styles.startText}>
          {isActive ? "Start Quiz" : "Not Available"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= RESULT CARD ================= */

function ResultCard({ result }) {
  const passed = result.result === "Passed";

  return (
    <View style={styles.card}>
      <Text style={styles.quizTitle}>{result.title}</Text>

      <Text style={styles.subject}>{result.description}</Text>

      <View style={styles.resultRow}>
        <Text style={styles.score}>
          Score: {result.score}/{result.total}
        </Text>
        <Text
          style={[
            styles.resultStatus,
            passed ? styles.pass : styles.fail
          ]}
        >
          {result.result}
        </Text>
      </View>

      <Text style={styles.metaText}>Percentage: {result.percentage}%</Text>
    </View>
  );
}

function EmptyCard({ icon, title, text }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name={icon} size={26} color="#94a3b8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subheading: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 20
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 20
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 4
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  quizTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a"
  },

  subject: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    marginTop: 4
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },

  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#64748b"
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },

  active: {
    backgroundColor: "#dcfce7"
  },

  upcoming: {
    backgroundColor: "#e5e7eb"
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a"
  },

  startBtn: {
    marginTop: 14,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  disabledBtn: {
    backgroundColor: "#94a3b8"
  },

  startText: {
    color: "#fff",
    fontWeight: "700"
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },

  score: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a"
  },

  resultStatus: {
    fontSize: 14,
    fontWeight: "700"
  },

  pass: {
    color: "#16a34a"
  },

  fail: {
    color: "#dc2626"
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: "center"
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a"
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20
  }
});
