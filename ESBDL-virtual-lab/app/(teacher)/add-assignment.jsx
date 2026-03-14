import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchAssignments } from "../../src/services/assignmentApi";

const CLASS_COLORS = {
  SY9: { bg: "#dbeafe", text: "#1d4ed8" },
  SY10: { bg: "#d1fae5", text: "#065f46" },
  SY11: { bg: "#ede9fe", text: "#5b21b6" },
};

function AssignmentCard({ item, onPress }) {
  const due = new Date(item.dueDate);
  const overdue = due < new Date();
  const submittedCount = item.submissions?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconBox}>
          <Ionicons name="document-text" size={22} color="#f59e0b" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.assignmentTitle}</Text>
          <Text style={styles.cardUnit} numberOfLines={1}>{item.unitTitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="calendar-outline" size={12} color={overdue ? "#ef4444" : "#64748b"} />
          <Text style={[styles.metaText, overdue && { color: "#ef4444" }]}>
            {due.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="trophy-outline" size={12} color="#64748b" />
          <Text style={styles.metaText}>{item.totalMarks} pts</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="checkmark-circle-outline" size={12} color="#10b981" />
          <Text style={[styles.metaText, { color: "#10b981" }]}>{submittedCount} submitted</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        {(item.classes || []).map((c) => (
          <View key={c} style={[styles.badge, { backgroundColor: CLASS_COLORS[c]?.bg ?? "#f1f5f9" }]}>
            <Text style={[styles.badgeText, { color: CLASS_COLORS[c]?.text ?? "#475569" }]}>{c}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function AddAssignment() {
  const router = useRouter();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await fetchAssignments();
      setAll(data);
    } catch {
      Alert.alert("Error", "Failed to load assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [])
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (a) =>
        a.assignmentTitle?.toLowerCase().includes(q) ||
        a.unitTitle?.toLowerCase().includes(q)
    );
  }, [all, search]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search assignments..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AssignmentCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/(teacher)/assignment-details",
                  params: { id: item._id },
                })
              }
            />
          )}
          contentContainerStyle={filtered.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No assignments yet</Text>
              <Text style={styles.emptySub}>Tap "+" to create your first assignment</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(teacher)/create-assignment")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a" },

  list: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#334155", marginTop: 16 },
  emptySub: { fontSize: 13, color: "#94a3b8", marginTop: 6, textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  cardUnit: { fontSize: 12, color: "#64748b", marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#64748b" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
