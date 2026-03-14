import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { fetchStudentAssignments } from "../../src/services/assignmentApi";

const CLASS_COLORS = {
  SY9: { bg: "#dbeafe", text: "#1d4ed8" },
  SY10: { bg: "#d1fae5", text: "#065f46" },
  SY11: { bg: "#ede9fe", text: "#5b21b6" },
};

function AssignmentCard({ assignment, onPress }) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{assignment.assignmentTitle}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{assignment.unitTitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={isOverdue ? "#ef4444" : "#64748b"} />
          <Text style={[styles.metaText, isOverdue && { color: "#ef4444" }]}>Due: {dueDate.toLocaleDateString("en-IN")}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="trophy-outline" size={13} color="#64748b" />
          <Text style={styles.metaText}>{assignment.totalMarks} marks</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        {(assignment.classes || []).map((c) => (
          <View key={c} style={[styles.badge, { backgroundColor: CLASS_COLORS[c]?.bg || "#f1f5f9" }]}>
            <Text style={[styles.badgeText, { color: CLASS_COLORS[c]?.text || "#475569" }]}>{c}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function Assignments() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadAssignments = async () => {
    try {
      const data = await fetchStudentAssignments();
      setAssignments(data);
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAssignments();
    }, [])
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return assignments;
    const q = search.toLowerCase();
    return assignments.filter(
      (a) =>
        a.assignmentTitle?.toLowerCase().includes(q) ||
        a.unitTitle?.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Assignments</Text>
        <Text style={styles.subtitle}>Assignments shared by your teachers</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholder="Search assignments..."
          placeholderTextColor="#94a3b8"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AssignmentCard
            assignment={item}
            onPress={() =>
              router.push({
                pathname: "/(student)/assignment-details",
                params: { id: item._id },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAssignments();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No assignments available</Text>
            <Text style={styles.emptySubText}>Teacher assignments for your class will appear here</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyWrap : styles.listWrap}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 3,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  emptySubText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
  },
});
