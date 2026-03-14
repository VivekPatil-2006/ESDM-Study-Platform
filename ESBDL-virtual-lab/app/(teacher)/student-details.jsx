import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchStudentAnalytics, fetchStudentById } from "../../src/services/studentApi";

export default function StudentDetails() {
  const { studentId } = useLocalSearchParams();
  const [student, setStudent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const [studentData, analyticsData] = await Promise.all([
          fetchStudentById(studentId),
          fetchStudentAnalytics(studentId),
        ]);
        setStudent(studentData);
        setAnalytics(analyticsData);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  const analyticsData = analytics || {
    overallScore: 0,
    assignmentCompletion: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    performance: [],
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>Student not found.</Text>
      </View>
    );
  }

  const studentClass = student.class
    ? student.class
    : Array.isArray(student.classAssigned) && student.classAssigned.length > 0
      ? student.classAssigned.join(", ").replace(/SE/g, "SY")
      : "Not Assigned";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        {student.photo ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${student.photo}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={42} color="#94a3b8" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.subInfo}>{student.rollNo}</Text>
          <Text style={styles.subInfo}>{student.email}</Text>
          <Text style={styles.subInfo}>Class: {studentClass}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Student Details</Text>
        <DetailRow label="Phone" value={student.phone || "N/A"} />
        <DetailRow label="Address" value={student.address || "N/A"} />
        <DetailRow label="Department" value={student.department || "N/A"} />
        <DetailRow label="Year" value={student.year || "N/A"} />
        <DetailRow label="Status" value={student.isActive ? "Active" : "Inactive"} />
      </View>

      <Text style={styles.sectionTitle}>Analytics (Live)</Text>

      <View style={styles.kpiRow}>
        <KpiCard label="Overall Score" value={`${analyticsData.overallScore}%`} color="#2563eb" />
        <KpiCard label="Assignment Completion" value={`${analyticsData.assignmentCompletion}%`} color="#16a34a" />
      </View>

      <View style={styles.kpiRow}>
        <KpiCard label="Completed" value={`${analyticsData.completedAssignments}`} color="#7c3aed" />
        <KpiCard label="Pending" value={`${analyticsData.pendingAssignments}`} color="#dc2626" />
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.sectionTitle}>Performance By Area</Text>
        {(analyticsData.performance || []).map((item) => (
          <View key={item.subject} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.subject}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${item.value}%` }]} />
            </View>
            <Text style={styles.barValue}>{item.value}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function KpiCard({ label, value, color }) {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  content: {
    padding: 18,
    paddingBottom: 26
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },

  emptyText: {
    fontSize: 16,
    color: "#64748b"
  },

  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 3
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37
  },

  avatarFallback: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center"
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a"
  },

  subInfo: {
    marginTop: 2,
    color: "#64748b"
  },

  detailsCard: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    elevation: 3
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 16
  },

  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 10
  },

  detailLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },

  detailValue: {
    marginTop: 4,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600"
  },

  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    elevation: 2
  },

  kpiLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700"
  },

  kpiValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900"
  },

  analyticsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    elevation: 3
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },

  barLabel: {
    width: 90,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700"
  },

  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden"
  },

  barFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 999
  },

  barValue: {
    width: 46,
    textAlign: "right",
    color: "#334155",
    fontWeight: "700",
    fontSize: 12
  }
});