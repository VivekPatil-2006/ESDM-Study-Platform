import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { createTeacherDiagram } from "../../src/services/diagramApi";

const BATCH_OPTIONS = ["SY9", "SY10", "SY11", "All"];

const initialLinks = {
  drawio: "https://app.diagrams.net/",
  creately: "https://creately.com/diagram-type/uml/",
  lucidchart: "https://www.lucidchart.com/pages/",
};

export default function CreateDiagram() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [targetBatch, setTargetBatch] = useState("All");
  const [links, setLinks] = useState(initialLinks);
  const [imageData, setImageData] = useState("");
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Allow gallery access to upload diagram image");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageData(asset.base64 || "");
      setImageMimeType(asset.mimeType || "image/jpeg");
    }
  };

  const onCreate = async () => {
    if (!title.trim() || !subject.trim() || !imageData) {
      Alert.alert("Missing Fields", "Title, subject and image are required.");
      return;
    }

    try {
      setSaving(true);

      await createTeacherDiagram({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        imageData,
        imageMimeType,
        targetBatch,
        practiceLinks: links,
      });

      Alert.alert("Success", "Diagram uploaded successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(teacher)/diagrams"),
        },
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to upload diagram";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Diagram</Text>
      <Text style={styles.subtitle}>Upload diagram details and practice links for students.</Text>

      <Text style={styles.label}>Diagram Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. UML Class Diagram"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Software Engineering"
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Key points or exercise steps"
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

      <Text style={styles.label}>Diagram Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Ionicons name="image-outline" size={20} color="#1d4ed8" />
        <Text style={styles.imagePickerText}>{imageData ? "Change Image" : "Choose Diagram Image"}</Text>
      </TouchableOpacity>

      {!!imageData && (
        <Image
          source={{ uri: `data:${imageMimeType};base64,${imageData}` }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.label}>Practice Link: Draw.io</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={links.drawio}
        onChangeText={(value) => setLinks((prev) => ({ ...prev, drawio: value }))}
      />

      <Text style={styles.label}>Practice Link: Creately</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={links.creately}
        onChangeText={(value) => setLinks((prev) => ({ ...prev, creately: value }))}
      />

      <Text style={styles.label}>Practice Link: Lucidchart</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={links.lucidchart}
        onChangeText={(value) => setLinks((prev) => ({ ...prev, lucidchart: value }))}
      />

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={onCreate} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload Diagram</Text>}
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
  imagePicker: {
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: { color: "#1d4ed8", fontWeight: "700" },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
