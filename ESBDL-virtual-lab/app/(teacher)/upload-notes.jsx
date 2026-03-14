import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import API from "../../src/services/api";

export default function UploadNotes() {
  const router = useRouter();

  const [unitNumber, setUnitNumber] = useState("");
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [classes, setClasses] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const classOptions = ["SY9", "SY10", "SY11"];

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
      });

      if (!result.canceled) {
        setFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log("File pick error:", err);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const photo = result.assets[0];
      setFiles((prev) => [
        ...prev,
        {
          uri: photo.uri,
          name: `photo-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          size: photo.fileSize || 0,
        },
      ]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleClass = (cls) => {
    setClasses((prev) => (prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]));
  };

  const uploadNotes = async () => {
    if (!unitNumber || !unit || !topic || classes.length === 0 || files.length === 0) {
      Alert.alert("Missing Fields", "Please fill all required fields and upload at least one file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("unitNumber", unitNumber);
      formData.append("unit", unit);
      formData.append("topic", topic);
      formData.append("classes", JSON.stringify(classes));

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append("files", {
          uri: file.uri,
          name: file.name || `file-${index}`,
          type: file.mimeType || file.type || "application/octet-stream",
        });
      }

      const token = await AsyncStorage.getItem("token");

      await API.post("/notes/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Notes uploaded successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);

      setUnitNumber("");
      setUnit("");
      setTopic("");
      setClasses([]);
      setFiles([]);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Upload failed";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "document-text";
    if (ext === "doc" || ext === "docx") return "document";
    if (ext === "ppt" || ext === "pptx") return "easel";
    if (["jpg", "jpeg", "png"].includes(ext)) return "image";
    return "document-attach";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: "Upload Notes",
          swipeEnabled: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace("/(teacher)/add-notes")}
              style={{ marginLeft: 14, padding: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />

      <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Ionicons name="cloud-upload" size={48} color="#fff" />
        <Text style={styles.headerTitle}>Upload Notes</Text>
        <Text style={styles.headerSub}>Share study materials with your students</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Unit Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="layers-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter unit number (e.g., 1, 2, 3)"
              keyboardType="numeric"
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Unit Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="book-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter unit name"
              value={unit}
              onChangeText={setUnit}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Topic <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="text-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter topic"
              value={topic}
              onChangeText={setTopic}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Select Classes <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.classRow}>
            {classOptions.map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => toggleClass(cls)}
                style={[styles.classBtn, classes.includes(cls) && styles.classActive]}
                activeOpacity={0.7}
              >
                {classes.includes(cls) && <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.classCheckIcon} />}
                <Text style={[styles.classText, classes.includes(cls) && styles.classTextActive]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Upload Files <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickFiles} activeOpacity={0.7}>
              <View style={[styles.uploadIconCircle, { backgroundColor: "#eff6ff" }]}>
                <Ionicons name="cloud-upload-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.uploadBtnText}>Choose Files</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto} activeOpacity={0.7}>
              <View style={[styles.uploadIconCircle, { backgroundColor: "#f0fdf4" }]}>
                <Ionicons name="camera-outline" size={24} color="#22c55e" />
              </View>
              <Text style={styles.uploadBtnText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {files.length > 0 && (
          <View style={styles.fileListContainer}>
            <Text style={styles.fileListTitle}>
              Uploaded Files ({files.length})
            </Text>
            {files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <View style={styles.fileIconCircle}>
                  <Ionicons name={getFileIcon(file.name)} size={20} color="#3b82f6" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>{((file.size || 0) / 1024).toFixed(1)} KB</Text>
                </View>
                <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeBtn} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={uploadNotes}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={loading ? ["#94a3b8", "#94a3b8"] : ["#3b82f6", "#2563eb"]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.submitText}>Publish Notes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
  headerSub: {
    fontSize: 14,
    color: "#bfdbfe",
    marginTop: 4,
  },

  formContainer: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  required: {
    color: "#ef4444",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
  },

  classRow: {
    flexDirection: "row",
    gap: 10,
  },

  classBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },

  classActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },

  classCheckIcon: {
    marginRight: -4,
  },

  classText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  classTextActive: {
    color: "#fff",
  },

  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },

  uploadBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  uploadBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  fileListContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },

  fileListTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },

  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  fileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },

  fileSize: {
    fontSize: 12,
    color: "#94a3b8",
  },

  removeBtn: {
    padding: 4,
  },

  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  submitBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },

  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
