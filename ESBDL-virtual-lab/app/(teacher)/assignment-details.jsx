import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Alert, Image, TouchableOpacity, Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import { fetchAssignmentById } from "../../src/services/assignmentApi";

/* ─────────────── helpers ─── */

const CLASS_COLORS = {
  SY9:  { bg: "#dbeafe", text: "#1d4ed8" },
  SY10: { bg: "#d1fae5", text: "#065f46" },
  SY11: { bg: "#ede9fe", text: "#5b21b6" },
};

const getFileIcon = (mimeType = "") => {
  if (mimeType.startsWith("image/"))      return { icon: "image-outline",         color: "#8b5cf6" };
  if (mimeType === "application/pdf")     return { icon: "document-text-outline",  color: "#ef4444" };
  if (mimeType.includes("word"))          return { icon: "document-outline",       color: "#2563eb" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
                                          return { icon: "grid-outline",            color: "#10b981" };
  return { icon: "attach-outline", color: "#64748b" };
};

const inferMimeFromName = (name = "") => {
  const ext = String(name).split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "application/octet-stream";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

/* ─────────────── section header ─── */

function SectionHeader({ icon, title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#0f172a" />
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

/* ─────────────── main ─── */

export default function AssignmentDetails() {
  const { id } = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState("");
  const [previewTitle, setPreviewTitle] = useState("Attachment Preview");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAssignmentById(id);
        setAssignment(data);
      } catch {
        Alert.alert("Error", "Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Assignment not found</Text>
      </View>
    );
  }

  const due = new Date(assignment.dueDate);
  const overdue = due < new Date();
  const attachments = assignment.attachments || [];

  const buildPreviewUrl = (att) => {
    const rawMime = String(att?.mimeType || "").toLowerCase();
    const nameBasedMime = inferMimeFromName(att?.name || "");
    const mime = (!rawMime || rawMime === "application/octet-stream")
      ? nameBasedMime
      : rawMime;
    const isPdf = mime.includes("pdf");
    const isImage = mime.startsWith("image/");

    if (att?.data) {
      if (isPdf || isImage) {
        return `data:${mime || "application/octet-stream"};base64,${att.data}`;
      }
      return null;
    }

    if (att?.fileUrl) {
      if (isPdf || isImage) {
        return att.fileUrl;
      }
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(att.fileUrl)}`;
    }

    return null;
  };

  const openPreview = (att, index) => {
    const uri = buildPreviewUrl(att);
    if (!uri) {
      Alert.alert("Preview Not Available", "This file cannot be previewed inside app.");
      return;
    }
    setPreviewTitle(att?.name || `Attachment ${index + 1}`);
    setPreviewUri(uri);
    setPreviewVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Header card ── */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconBox}>
          <Ionicons name="document-text" size={28} color="#f59e0b" />
        </View>
        <Text style={styles.assignmentTitle}>{assignment.assignmentTitle}</Text>
        <Text style={styles.unitTitle}>{assignment.unitTitle}</Text>

        <View style={styles.classBadgeRow}>
          {(assignment.classes || []).map(c => (
            <View key={c} style={[styles.badge, { backgroundColor: CLASS_COLORS[c]?.bg ?? "#f1f5f9" }]}>
              <Text style={[styles.badgeText, { color: CLASS_COLORS[c]?.text ?? "#475569" }]}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Info grid ── */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Ionicons name="calendar-outline" size={20} color={overdue ? "#ef4444" : "#0ea5e9"} />
          <Text style={styles.infoLabel}>Due Date</Text>
          <Text style={[styles.infoValue, overdue && { color: "#ef4444" }]}>
            {formatDate(assignment.dueDate)}
          </Text>
          {overdue && <Text style={styles.overdueBadge}>Overdue</Text>}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
          <Text style={styles.infoLabel}>Total Marks</Text>
          <Text style={styles.infoValue}>{assignment.totalMarks}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="attach-outline" size={20} color="#10b981" />
          <Text style={styles.infoLabel}>Attachments</Text>
          <Text style={styles.infoValue}>{attachments.length}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color="#8b5cf6" />
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(assignment.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short",
            })}
          </Text>
        </View>
      </View>

      {/* ── Description ── */}
      {!!assignment.description && (
        <View style={styles.section}>
          <SectionHeader icon="document-outline" title="Description" />
          <Text style={styles.description}>{assignment.description}</Text>
        </View>
      )}

      {/* ── Attachments ── */}
      <View style={styles.section}>
        <SectionHeader
          icon="attach-outline"
          title="Attachments"
          count={attachments.length}
        />

        {attachments.length === 0 ? (
          <View style={styles.emptyRow}>
            <Ionicons name="folder-open-outline" size={32} color="#cbd5e1" />
            <Text style={styles.emptyRowText}>No attachments</Text>
          </View>
        ) : (
          <View style={styles.attachmentList}>
            {attachments.map((att, i) => {
              const isImage = att.mimeType?.startsWith("image/");
              const { icon, color } = getFileIcon(att.mimeType);
              return (
                <View key={i} style={styles.attachmentItem}>
                  {isImage && att.data ? (
                    <Image
                      source={{ uri: `data:${att.mimeType};base64,${att.data}` }}
                      style={styles.attachThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.attachIconBox, { backgroundColor: `${color}18` }]}>
                      <Ionicons name={icon} size={22} color={color} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.attachName} numberOfLines={1}>{att.name}</Text>
                    <Text style={styles.attachMime} numberOfLines={1}>{att.mimeType}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={() => openPreview(att, i)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#2563eb" />
                    <Text style={styles.previewBtnText}>Preview</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

        <Modal
          visible={previewVisible}
          animationType="slide"
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={() => setPreviewVisible(false)}
                style={{ padding: 4 }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.previewTitle} numberOfLines={1}>{previewTitle}</Text>
              <View style={{ width: 24 }} />
            </View>

            {previewUri ? (
              <WebView
                source={{ uri: previewUri }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2563eb" />
                  </View>
                )}
              />
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyRowText}>Unable to load preview</Text>
              </View>
            )}
          </View>
        </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ─────────────── styles ─── */
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#f8fafc" },
  content:   { padding: 16 },
  centered:  { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#ef4444", marginTop: 12 },

  /* header card */
  headerCard: {
    backgroundColor: "#0f172a", borderRadius: 16, padding: 20,
    alignItems: "center", marginBottom: 16,
  },
  headerIconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 19, fontWeight: "800", color: "#f8fafc",
    textAlign: "center", marginBottom: 4,
  },
  unitTitle: {
    fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 12,
  },
  classBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontSize: 12, fontWeight: "700" },

  /* info grid */
  infoGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16,
  },
  infoCard: {
    flex: 1, minWidth: "44%",
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoLabel:    { fontSize: 11, color: "#94a3b8", marginTop: 6, fontWeight: "600" },
  infoValue:    { fontSize: 16, fontWeight: "800", color: "#0f172a", marginTop: 2 },
  overdueBadge: {
    marginTop: 4, paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: "#fee2e2", borderRadius: 20,
    fontSize: 10, color: "#ef4444", fontWeight: "700",
  },

  /* section */
  section: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", flex: 1 },
  countBadge:   {
    backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: "700", color: "#475569" },

  description: { fontSize: 14, color: "#334155", lineHeight: 22 },

  /* empty state inside section */
  emptyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  emptyRowText: { fontSize: 14, color: "#94a3b8" },

  /* attachments */
  attachmentList: { gap: 10 },
  attachmentItem: {
    flexDirection: "row", alignItems: "center",
    padding: 10, backgroundColor: "#f8fafc",
    borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
  },
  attachIconBox: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  attachThumb: { width: 44, height: 44, borderRadius: 10 },
  attachName:  { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  attachMime:  { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  previewBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewBtnText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewHeader: {
    paddingTop: 52,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  webview: {
    flex: 1,
  },
});
