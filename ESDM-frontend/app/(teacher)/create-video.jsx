import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { createTeacherVideo } from "../../src/services/videoApi";

const BATCH_OPTIONS = ["SY9", "SY10", "SY11", "All"];

export default function CreateVideo() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetBatch, setTargetBatch] = useState("All");
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert("Missing Fields", "Title and YouTube URL are required.");
      return;
    }

    try {
      setSaving(true);
      await createTeacherVideo({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        targetBatch,
      });

      Alert.alert("Success", "Video link uploaded successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(teacher)/videos"),
        },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to upload video link";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Video Link</Text>
      <Text style={styles.subtitle}>Fill details and share YouTube video with students.</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Introduction to Sensors"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>YouTube URL</Text>
      <TextInput
        style={styles.input}
        placeholder="https://www.youtube.com/watch?v=..."
        autoCapitalize="none"
        value={url}
        onChangeText={setUrl}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Optional description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Target Batch</Text>
      <View style={styles.batchRow}>
        {BATCH_OPTIONS.map((batch) => {
          const active = batch === targetBatch;
          return (
            <TouchableOpacity
              key={batch}
              style={[styles.batchChip, active && styles.batchChipActive]}
              onPress={() => setTargetBatch(batch)}
            >
              <Text style={[styles.batchChipText, active && styles.batchChipTextActive]}>{batch}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={onCreate} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload Video Link</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 23, fontWeight: "800", color: "#0f172a" },
  subtitle: { marginTop: 5, color: "#64748b", marginBottom: 14 },
  label: { marginTop: 10, marginBottom: 6, fontWeight: "700", color: "#334155" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  batchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  batchChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  batchChipActive: { backgroundColor: "#1d4ed8" },
  batchChipText: { color: "#334155", fontWeight: "700" },
  batchChipTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
