import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { WebView } from "react-native-webview";

import { fetchStudentAssignmentById } from "../../src/services/assignmentApi";

const CLASS_COLORS = {
  SY9: { bg: "#dbeafe", text: "#1d4ed8" },
  SY10: { bg: "#d1fae5", text: "#065f46" },
  SY11: { bg: "#ede9fe", text: "#5b21b6" },
};

export default function StudentAssignmentDetails() {
  const { id } = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState(-1);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState("");
  const [previewTitle, setPreviewTitle] = useState("Attachment Preview");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStudentAssignmentById(id);
        setAssignment(data);
      } catch (error) {
        Alert.alert("Error", error?.response?.data?.message || "Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const extensionFromMime = (mimeType = "") => {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.includes("word")) return "docx";
    if (mimeType.includes("presentation")) return "pptx";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "xlsx";
    if (mimeType.includes("jpeg")) return "jpg";
    if (mimeType.includes("png")) return "png";
    return "bin";
  };

  const safeFileName = (name) =>
    String(name || "assignment_file")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);

  const buildPreviewUrl = (file) => {
    const mimeType = String(file?.mimeType || "").toLowerCase();
    const isPdf = mimeType.includes("pdf");
    const isImage = mimeType.startsWith("image/");

    if (file?.data) {
      if (isPdf || isImage) {
        return `data:${mimeType || "application/octet-stream"};base64,${file.data}`;
      }
      return null;
    }

    if (file?.fileUrl) {
      if (isPdf || isImage) {
        return file.fileUrl;
      }
      // Fallback viewer for docs/ppt etc. when hosted via URL.
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(file.fileUrl)}`;
    }

    return null;
  };

  const openInAppPreview = (file, index) => {
    const previewUrl = buildPreviewUrl(file);
    if (!previewUrl) {
      Alert.alert(
        "Preview Not Available",
        "This file type cannot be previewed inside app. Please use Download."
      );
      return;
    }

    setPreviewTitle(file?.name || file?.fileName || `File ${index + 1}`);
    setPreviewUri(previewUrl);
    setPreviewVisible(true);
  };

  const downloadFile = async (file, index) => {
    try {
      setDownloadingIndex(index);
      const ext = extensionFromMime(file.mimeType);
      const baseName = safeFileName(file.name || file.fileName);
      const nameWithExt = baseName.includes(".") ? baseName : `${baseName}.${ext}`;

      // Web/PWA path: trigger browser file download directly.
      if (Platform.OS === "web") {
        const downloadFromBlob = (blob) => {
          const objectUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = nameWithExt;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(objectUrl);
        };

        if (file?.data) {
          const base64 = String(file.data).replace(/\s/g, "");
          const byteChars = atob(base64);
          const byteArray = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteArray[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([byteArray], {
            type: file?.mimeType || "application/octet-stream",
          });
          downloadFromBlob(blob);
        } else if (file?.fileUrl) {
          const response = await fetch(file.fileUrl);
          if (!response.ok) {
            throw new Error("Unable to fetch file for download");
          }
          const blob = await response.blob();
          downloadFromBlob(blob);
        } else {
          throw new Error("No attachment content found");
        }

        Alert.alert("Downloaded", "File download has started in your browser");
        return;
      }

      const rootDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      if (!rootDir) {
        throw new Error("No writable directory available");
      }

      const folder = `${rootDir}assignments/`;
      const folderInfo = await FileSystem.getInfoAsync(folder);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
      }

      const path = `${folder}${Date.now()}_${nameWithExt}`;

      if (file?.data) {
        await FileSystem.writeAsStringAsync(path, file.data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (file?.fileUrl) {
        await FileSystem.downloadAsync(file.fileUrl, path);
      } else {
        throw new Error("No attachment content found");
      }

      Alert.alert("Downloaded", `File saved locally to app storage:\n${path}`);
    } catch (error) {
      console.log("Download error:", error);
      Alert.alert("Download Failed", error?.message || "Unable to save file locally");
    } finally {
      setDownloadingIndex(-1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={54} color="#ef4444" />
        <Text style={styles.errorText}>Assignment not found</Text>
      </View>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{assignment.assignmentTitle}</Text>
        <Text style={styles.subTitle}>{assignment.unitTitle}</Text>

        <View style={styles.badgeRow}>
          {(assignment.classes || []).map((c) => (
            <View key={c} style={[styles.badge, { backgroundColor: CLASS_COLORS[c]?.bg || "#f1f5f9" }]}>
              <Text style={[styles.badgeText, { color: CLASS_COLORS[c]?.text || "#475569" }]}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={isOverdue ? "#ef4444" : "#2563eb"} />
          <Text style={styles.infoLabel}>Due Date</Text>
          <Text style={[styles.infoValue, isOverdue && { color: "#ef4444" }]}>{dueDate.toLocaleDateString("en-IN")}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="trophy-outline" size={18} color="#2563eb" />
          <Text style={styles.infoLabel}>Total Marks</Text>
          <Text style={styles.infoValue}>{assignment.totalMarks}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descText}>{assignment.description || "No description provided"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachments</Text>

        {(assignment.attachments || []).length === 0 ? (
          <Text style={styles.emptyText}>No files attached by teacher</Text>
        ) : (
          assignment.attachments.map((file, index) => (
            <View key={index} style={styles.fileRow}>
              <View style={styles.fileLeft}>
                <View style={styles.fileIconBox}>
                  <Ionicons name="document-text-outline" size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name || `File ${index + 1}`}</Text>
                  <Text style={styles.fileType} numberOfLines={1}>{file.mimeType || "application/octet-stream"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => downloadFile(file, index)}
                disabled={downloadingIndex === index}
              >
                {downloadingIndex === index ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={16} color="#fff" />
                    <Text style={styles.downloadText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => openInAppPreview(file, index)}
              >
                <Ionicons name="eye-outline" size={16} color="#2563eb" />
                <Text style={styles.viewText}>View</Text>
              </TouchableOpacity>
            </View>
          ))
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
              <Text style={styles.emptyText}>Unable to load preview</Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  subTitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 4,
  },
  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 13,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  fileLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  fileType: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748b",
  },
  downloadBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 98,
    justifyContent: "center",
  },
  downloadText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 86,
    justifyContent: "center",
    backgroundColor: "#eff6ff",
  },
  viewText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12,
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
