import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { LineChart, BarChart } from "react-native-chart-kit";
import { fetchTeacherDashboardAnalytics } from "../../src/services/dashboardApi";

const screenWidth = Dimensions.get("window").width;

const chartConfigBlue = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37,99,235,${opacity})`,
  labelColor: () => "#64748b",
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#2563eb",
  },
};

const chartConfigGreen = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(22,163,74,${opacity})`,
  labelColor: () => "#64748b",
};

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const loadHeaderIdentity = async () => {
    const userData = await AsyncStorage.getItem("user");
    const image = await AsyncStorage.getItem("profileImage");
    if (userData) setTeacher(JSON.parse(userData));
    setProfileImage(image || null);
  };

  const loadAnalytics = async () => {
    try {
      const data = await fetchTeacherDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.log("Dashboard fetch error:", error?.response?.data || error?.message || error);
      setAnalytics(null);
    }
  };

  const loadAll = async () => {
    try {
      await Promise.all([loadHeaderIdentity(), loadAnalytics()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const overview = analytics?.overview || {
    totalStudents: 0,
    totalAssignments: 0,
    totalNotes: 0,
    totalQuizzes: 0,
  };

  const charts = analytics?.charts || {};
  const trendLabels = charts.assignmentSubmissionTrend?.labels?.length
    ? charts.assignmentSubmissionTrend.labels
    : ["-", "-", "-", "-", "-", "-"];
  const trendValues = charts.assignmentSubmissionTrend?.values?.length
    ? charts.assignmentSubmissionTrend.values
    : [0, 0, 0, 0, 0, 0];

  const quizLabels = charts.quizPerformance?.labels?.length
    ? charts.quizPerformance.labels
    : ["No", "Data"];
  const quizValues = charts.quizPerformance?.values?.length
    ? charts.quizPerformance.values
    : [0, 0];

  const summary = analytics?.todaySummary || {
    dueTodayAssignments: 0,
    notesUploadedToday: 0,
    activeQuizzes: 0,
    totalStudents: 0,
  };

  const recentActivity = analytics?.recentActivity || [];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadAll();
          }}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.name}>{teacher?.name || "Teacher"}</Text>
            <Text style={styles.role}>{teacher?.role}</Text>
          </View>

          {profileImage ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${profileImage}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color="#94a3b8" />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.analyticsGrid}>
        <AnalyticsCard title="Students" value={overview.totalStudents} icon="people" />
        <AnalyticsCard title="Assignments" value={overview.totalAssignments} icon="clipboard" />
        <AnalyticsCard title="Notes" value={overview.totalNotes} icon="document-text" />
        <AnalyticsCard title="Quizzes" value={overview.totalQuizzes} icon="help-circle" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Assignment Submissions (Last 6 Days)</Text>
        <LineChart
          data={{ labels: trendLabels, datasets: [{ data: trendValues }] }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfigBlue}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Quiz Performance (Average % by Batch)</Text>
        <BarChart
          data={{ labels: quizLabels, datasets: [{ data: quizValues }] }}
          width={screenWidth - 32}
          height={220}
          fromZero
          chartConfig={chartConfigGreen}
          style={styles.chart}
        />
      </View>

      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <View style={styles.summaryCard}>
        <SummaryItem icon="clipboard" text={`${summary.dueTodayAssignments} Assignments Due Today`} />
        <SummaryItem icon="document-text" text={`${summary.notesUploadedToday} Notes Uploaded Today`} />
        <SummaryItem icon="help-circle" text={`${summary.activeQuizzes} Active Quizzes`} />
        <SummaryItem icon="people" text={`${summary.totalStudents} Students Enrolled`} />
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        {recentActivity.length === 0 ? (
          <Text style={styles.emptyText}>No recent teacher activity yet</Text>
        ) : (
          recentActivity.map((item, idx) => (
            <ActivityItem key={idx} icon={item.icon || "time"} text={item.text} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function AnalyticsCard({ title, value, icon }) {
  return (
    <View style={styles.analyticsCard}>
      <Ionicons name={icon} size={24} color="#2563eb" />
      <Text style={styles.analyticsValue}>{value ?? 0}</Text>
      <Text style={styles.analyticsTitle}>{title}</Text>
    </View>
  );
}

function SummaryItem({ icon, text }) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={18} color="#2563eb" />
      <Text style={styles.summaryText}>{text}</Text>
    </View>
  );
}

function ActivityItem({ icon, text }) {
  return (
    <View style={styles.activityItem}>
      <Ionicons name={icon} size={18} color="#2563eb" />
      <Text style={styles.activityText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#2563eb",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    color: "#c7d2fe",
    fontSize: 14,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  role: {
    color: "#e0e7ff",
    fontSize: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0f172a",
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
  },
  analyticsValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
    color: "#0f172a",
  },
  analyticsTitle: {
    fontSize: 12,
    color: "#64748b",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  summaryText: {
    color: "#334155",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  activityText: {
    color: "#334155",
    flex: 1,
  },
  emptyText: {
    color: "#94a3b8",
  },
});
