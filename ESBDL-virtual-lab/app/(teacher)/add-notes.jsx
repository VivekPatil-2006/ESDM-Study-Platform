import { useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import API from "../../src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

export default function NotesHome() {
  const router = useRouter();
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ========= FETCH NOTES ========= */
  const fetchNotes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/notes/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const openPreview = async (note) => {
    if (!note.files?.length) return;

    if (note.files.length === 1) {
      await WebBrowser.openBrowserAsync(note.files[0].fileUrl);
    } else {
      setSelectedNote(note);
      setModalVisible(true);
    }
  };

  const NoteCard = ({ item, index }) => {
    const unitColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"];
    const numericUnit = Number(item.unitNumber) || index;
    const gradientColor = unitColors[numericUnit % unitColors.length];

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity style={styles.card} onPress={() => openPreview(item)} activeOpacity={0.7}>
          <LinearGradient
            colors={[`${gradientColor}15`, `${gradientColor}05`]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.unitBadge, { backgroundColor: gradientColor }]}>
              <Text style={styles.unitBadgeText}>Unit {item.unitNumber}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.topic} numberOfLines={2}>
                {item.topic}
              </Text>
              <Text style={styles.unitName} numberOfLines={1}>
                {item.unit}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.classes?.join(", ")}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="document-text-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{item.files?.length || 0} files</Text>
                </View>
              </View>
            </View>

            <View style={[styles.viewIcon, { backgroundColor: `${gradientColor}20` }]}>
              <Ionicons name="eye-outline" size={22} color={gradientColor} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Notes</Text>
        <Text style={styles.headerSub}>Access all uploaded study materials</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <NoteCard item={item} index={index} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No notes uploaded yet</Text>
              <Text style={styles.emptySubText}>Start by uploading your first note</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select File to Open</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.fileList}>
              {selectedNote?.files?.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fileOption}
                  onPress={async () => {
                    setModalVisible(false);
                    await WebBrowser.openBrowserAsync(file.fileUrl);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.fileIconCircle}>
                    <Ionicons name="document-text" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.fileName || `File ${index + 1}`}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/(teacher)/upload-notes")} activeOpacity={0.8}>
        <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    position: "relative",
  },
  unitBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  unitBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardContent: {
    paddingRight: 80,
  },
  topic: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    lineHeight: 22,
  },
  unitName: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  viewIcon: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  fileList: {
    gap: 8,
    marginBottom: 16,
  },
  fileOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fee2e2",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#dc2626",
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    borderRadius: 30,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
