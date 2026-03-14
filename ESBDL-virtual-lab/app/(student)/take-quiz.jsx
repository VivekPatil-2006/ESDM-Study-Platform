import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchStudentQuizById,
  submitStudentQuiz
} from "../../src/services/quizApi";

function parseDurationToSeconds(duration) {
  const rawValue = String(duration || "").toLowerCase();
  const numberMatch = rawValue.match(/\d+/);
  const minutes = numberMatch ? Number(numberMatch[0]) : 0;
  return minutes * 60;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TakeQuiz() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetchStudentQuizById(quizId);
        setQuiz(response);
        setRemainingSeconds(parseDurationToSeconds(response.duration));
      } catch (error) {
        const message = error.response?.data?.message || "Unable to load quiz.";
        Alert.alert("Error", message, [
          {
            text: "Back",
            onPress: () => router.replace("/(student)/quizzes")
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, router]);

  useEffect(() => {
    if (!quiz || result || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previousValue) => {
        if (previousValue <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previousValue - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result, remainingSeconds]);

  useEffect(() => {
    if (quiz && !result && remainingSeconds === 0) {
      handleSubmitQuiz(true);
    }
  }, [remainingSeconds, quiz, result]);

  const currentQuestion = useMemo(() => quiz?.questions?.[currentIndex] || null, [quiz, currentIndex]);

  const selectOption = (option) => {
    if (!currentQuestion || submitting || result) {
      return;
    }

    setSelectedAnswers((previousValue) => ({
      ...previousValue,
      [currentQuestion.questionIndex]: option
    }));
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quiz || submitting || result) {
      return;
    }

    try {
      setSubmitting(true);
      const answers = quiz.questions.map((question) => ({
        questionIndex: question.questionIndex,
        selectedOption: selectedAnswers[question.questionIndex] || ""
      }));

      const submissionResult = await submitStudentQuiz(quiz._id, answers);
      setResult(submissionResult);

      if (autoSubmit) {
        Alert.alert("Time Up", "Quiz submitted automatically.");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Unable to submit quiz.";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
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
      <View style={styles.loader}>
        <Text style={styles.emptyText}>Quiz not available.</Text>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Ionicons name="trophy-outline" size={46} color="#f59e0b" />
          <Text style={styles.resultTitle}>{quiz.name}</Text>
          <Text style={styles.resultScore}>{result.score}/{result.total}</Text>
          <Text style={styles.resultSubtitle}>Score</Text>
          <Text style={styles.resultMeta}>Percentage: {result.percentage}%</Text>
          <Text style={[styles.resultStatus, result.result === "Passed" ? styles.pass : styles.fail]}>
            {result.result}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(student)/quizzes")}
          >
            <Text style={styles.backButtonText}>Back To Quizzes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quizTitle}>{quiz.name}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="timer-outline" size={16} color="#fff" />
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Question {currentIndex + 1} of {quiz.questions.length}</Text>
        <Text style={styles.progressText}>Batch: {quiz.targetBatch}</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        {currentQuestion?.options.map((option) => {
          const isSelected = selectedAnswers[currentQuestion.questionIndex] === option;

          return (
            <TouchableOpacity
              key={`${currentQuestion.questionIndex}-${option}`}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => selectOption(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((previousValue) => previousValue - 1)}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentIndex < quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentIndex((previousValue) => previousValue + 1)}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={() => handleSubmitQuiz(false)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  content: {
    padding: 18,
    paddingBottom: 28
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },

  emptyText: {
    fontSize: 16,
    color: "#475569"
  },

  headerCard: {
    backgroundColor: "#1d4ed8",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    gap: 12
  },

  quizTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff"
  },

  quizDescription: {
    marginTop: 8,
    color: "#dbeafe",
    lineHeight: 20
  },

  timerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },

  timerText: {
    color: "#ffffff",
    fontWeight: "800"
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16
  },

  progressText: {
    color: "#64748b",
    fontWeight: "700"
  },

  questionCard: {
    marginTop: 18,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    elevation: 4
  },

  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 26
  },

  optionButton: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    backgroundColor: "#ffffff"
  },

  optionButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe"
  },

  optionText: {
    color: "#0f172a",
    fontWeight: "600"
  },

  optionTextSelected: {
    color: "#1d4ed8"
  },

  navigationRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },

  navButton: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center"
  },

  navButtonDisabled: {
    backgroundColor: "#94a3b8"
  },

  navButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  },

  submitButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center"
  },

  submitButtonDisabled: {
    opacity: 0.7
  },

  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  },

  resultCard: {
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    elevation: 5
  },

  resultTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center"
  },

  resultScore: {
    marginTop: 20,
    fontSize: 42,
    fontWeight: "900",
    color: "#2563eb"
  },

  resultSubtitle: {
    marginTop: 6,
    color: "#64748b",
    fontWeight: "700"
  },

  resultMeta: {
    marginTop: 16,
    color: "#334155",
    fontWeight: "700"
  },

  resultStatus: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800"
  },

  pass: {
    color: "#16a34a"
  },

  fail: {
    color: "#dc2626"
  },

  backButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20
  },

  backButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});