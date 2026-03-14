import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { createTeacherQuiz } from "../../src/services/quizApi";

const batchOptions = ["SY9", "SY10", "SY11", "All"];

export default function CreateQuiz() {
  const router = useRouter();
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [targetBatch, setTargetBatch] = useState("SY9");
  const [duration, setDuration] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickExcelFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ],
      copyToCacheDirectory: true
    });

    if (!result.canceled) {
      setExcelFile(result.assets[0]);
    }
  };

  const handleAddQuiz = async () => {
    if (!quizName.trim() || !quizDescription.trim() || !duration.trim() || !excelFile) {
      Alert.alert("Missing Fields", "Please fill all fields and attach an Excel file.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", quizName.trim());
      formData.append("description", quizDescription.trim());
      formData.append("targetBatch", targetBatch);
      formData.append("duration", duration.trim());
      formData.append("file", {
        uri: excelFile.uri,
        name: excelFile.name,
        type: excelFile.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      await createTeacherQuiz(formData);

      Alert.alert("Success", "Quiz created successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(teacher)/activate-quiz")
        }
      ]);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to create quiz right now.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Quiz</Text>
      <Text style={styles.subtitle}>
        Add quiz details, choose the target batch, and attach the Excel sheet with question, options, and answer columns.
      </Text>

      <Text style={styles.label}>Quiz Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter quiz name"
        value={quizName}
        onChangeText={setQuizName}
      />

      <Text style={styles.label}>Quiz Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter quiz description"
        multiline
        value={quizDescription}
        onChangeText={setQuizDescription}
      />

      <Text style={styles.label}>Target Batch</Text>
      <View style={styles.batchRow}>
        {batchOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.batchButton,
              targetBatch === option && styles.batchButtonActive
            ]}
            onPress={() => setTargetBatch(option)}
          >
            <Text
              style={[
                styles.batchText,
                targetBatch === option && styles.batchTextActive
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Duration</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 20 Minutes"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={styles.label}>Excel File</Text>
      <TouchableOpacity style={styles.fileButton} onPress={pickExcelFile} activeOpacity={0.85}>
        <Ionicons name="document-attach-outline" size={22} color="#2563eb" />
        <Text style={styles.fileButtonText}>
          {excelFile ? excelFile.name : "Upload Excel file"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.fileHint}>
        Sample sheet available in repo: files/mcq_questions.xlsx
      </Text>

      <TouchableOpacity
        style={[styles.addButton, saving && styles.disabledButton]}
        onPress={handleAddQuiz}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Quiz</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  content: {
    padding: 20,
    paddingBottom: 40
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 18
  },

  label: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155"
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a"
  },

  textArea: {
    minHeight: 110,
    textAlignVertical: "top"
  },

  batchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },

  batchButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#e2e8f0"
  },

  batchButtonActive: {
    backgroundColor: "#2563eb"
  },

  batchText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155"
  },

  batchTextActive: {
    color: "#ffffff"
  },

  fileButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#93c5fd",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  fileButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700"
  },

  fileHint: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18
  },

  addButton: {
    marginTop: 28,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },

  disabledButton: {
    opacity: 0.7
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800"
  }
});