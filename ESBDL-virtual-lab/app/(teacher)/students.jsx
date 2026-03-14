import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchStudents } from "../../src/services/studentApi";

export default function Students() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const batchOptions = ["All", "SY9", "SY10", "SY11"];

  const loadStudents = async (searchValue = search, batchValue = batch) => {
    try {
      const data = await fetchStudents({
        search: searchValue,
        batch: batchValue,
      });
      setStudents(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadStudents(search, batch);
    }, [search, batch])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents(search, batch);
  };

  const onSearchChange = (text) => {
    setSearch(text);
  };

  const filteredInfo = useMemo(() => {
    return `${students.length} students`;
  }, [students]);

  const getDisplayClass = (student) => {
    if (student.class) {
      return student.class;
    }

    const firstClass = Array.isArray(student.classAssigned) ? student.classAssigned[0] : "";
    if (!firstClass) {
      return "Not Assigned";
    }
    return firstClass.replace("SE", "SY");
  };

  const openStudentDetails = (studentId) => {
    router.push({
      pathname: "/(teacher)/student-details",
      params: { studentId },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students</Text>
        <Text style={styles.headerSub}>Search and filter by class</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, roll no, email"
          value={search}
          onChangeText={onSearchChange}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.filterRow}>
        {batchOptions.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.pill, batch === item && styles.pillActive]}
            onPress={() => setBatch(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, batch === item && styles.pillTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{filteredInfo}</Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item._id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.studentCard}
              activeOpacity={0.85}
              onPress={() => openStudentDetails(item._id)}
            >
              <View style={[styles.avatarCircle, { backgroundColor: avatarColors[index % avatarColors.length] }]}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
              </View>

              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.metaText}>{item.rollNo} • {item.email}</Text>
                <Text style={styles.metaText}>Class: {getDisplayClass(item)}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={34} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptyText}>Try changing search text or filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#22c55e"];

function getInitials(name) {
  const parts = String(name || "").trim().split(" ").filter(Boolean);
  return (parts[0]?.[0] || "S") + (parts[1]?.[0] || "");
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  headerSub: {
    marginTop: 4,
    color: "#64748b"
  },

  searchBox: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a"
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 14
  },

  pill: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },

  pillActive: {
    backgroundColor: "#2563eb"
  },

  pillText: {
    color: "#334155",
    fontWeight: "700"
  },

  pillTextActive: {
    color: "#ffffff"
  },

  sectionLabel: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    color: "#64748b",
    fontWeight: "700"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24
  },

  studentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 3
  },

  avatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  metaText: { marginTop: 2, color: "#64748b", fontSize: 12 },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginTop: 16
  },

  emptyTitle: {
    marginTop: 10,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800"
  },

  emptyText: {
    marginTop: 6,
    color: "#64748b",
    textAlign: "center"
  },
});