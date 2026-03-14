import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { fetchStudentDashboardAnalytics } from "../../src/services/dashboardApi";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    kpis: {
      notes: 0,
      quizzes: 0,
      assignments: 0,
      avgScore: 0,
    },
    progress: {
      weeklyProgress: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      quizzesAvailable: 0,
      quizzesTaken: 0,
    },
  });

  const loadDashboard = async () => {
    try {
      const data = await fetchStudentDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.log("Student dashboard fetch error:", error?.response?.data || error?.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDashboard();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const stats = analytics?.kpis || {};
  const progress = analytics?.progress || {};
  const weeklyProgress = Math.max(0, Math.min(100, Number(progress.weeklyProgress || 0)));

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboard();
          }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Student Dashboard</Text>
        <Text style={styles.subtitle}>Your learning overview</Text>
      </View>

      {/* KPI ROW */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="book-outline"
          label="Notes"
          value={stats.notes ?? 0}
          color="#2563eb"
        />
        <KpiCard
          icon="help-circle-outline"
          label="Quizzes Taken"
          value={stats.quizzes ?? 0}
          color="#16a34a"
        />
      </View>

      <View style={styles.kpiRow}>
        <KpiCard
          icon="document-text-outline"
          label="Assignments"
          value={stats.assignments ?? 0}
          color="#f59e0b"
        />
        <KpiCard
          icon="trophy-outline"
          label="Quiz Avg Score"
          value={`${stats.avgScore ?? 0}%`}
          color="#7c3aed"
        />
      </View>

      {/* PROGRESS CARD */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${weeklyProgress}%` }]} />
        </View>

        <Text style={styles.progressText}>{weeklyProgress}% completed based on available quizzes & assignments</Text>
        <Text style={styles.progressMeta}>
          Completed Assignments: {progress.completedAssignments ?? 0} | Pending: {progress.pendingAssignments ?? 0}
        </Text>
        <Text style={styles.progressMeta}>
          Quizzes Taken: {progress.quizzesTaken ?? 0} / {progress.quizzesAvailable ?? 0}
        </Text>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsGrid}>
        <ActionCard icon="book" title="Notes" />
        <ActionCard icon="help-circle" title="Quizzes" />
        <ActionCard icon="brush" title="Diagrams" />
        <ActionCard icon="person" title="Profile" />
      </View>

      <View style={styles.progressCard2}>
        <Text style={styles.sectionTitle}>THANK YOU</Text>
        <Text style={styles.progressText}></Text>
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function KpiCard({ icon, label, value, color }) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, title }) {
  return (
    <View style={styles.actionCard}>
      <Ionicons name={icon} size={26} color="#2563eb" />
      <Text style={styles.actionText}>{title}</Text>
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9"
  },

  header: {
    marginBottom: 20
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b"
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },

  kpiCard: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 16,
    padding: 16,
    elevation: 4
  },

  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },

  kpiValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a"
  },

  progressCard2: {
  justifyContent: 'center', // vertical center
  alignItems: 'center',     // horizontal center
},

  kpiLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748b"
  },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
    elevation: 4
  },

  progressBarBg: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    marginTop: 10
  },

  progressBarFill: {
    height: 10,
    backgroundColor: "#2563eb",
    borderRadius: 10
  },

  progressText: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748b"
  },

  progressMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569"
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 25,
    marginBottom: 12
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  actionCard: {
    backgroundColor: "#fff",
    width: "48%",
    height: 90,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    elevation: 3
  },

  actionText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a"
  }
});
