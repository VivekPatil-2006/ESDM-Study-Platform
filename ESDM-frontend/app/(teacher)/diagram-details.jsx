import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { fetchTeacherDiagramById } from "../../src/services/diagramApi";

const openUrl = async (url) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Error", "Unable to open website.");
  }
};

export default function DiagramDetails() {
  const { id } = useLocalSearchParams();
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiagram = async () => {
      try {
        const data = await fetchTeacherDiagramById(id);
        setDiagram(data);
      } catch {
        Alert.alert("Error", "Failed to load diagram details");
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!diagram) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Diagram details not found</Text>
      </View>
    );
  }

  const links = diagram.practiceLinks || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Image
          source={{ uri: `data:${diagram.imageMimeType || "image/jpeg"};base64,${diagram.imageData}` }}
          style={styles.previewImage}
          resizeMode="cover"
        />

        <Text style={styles.title}>{diagram.title}</Text>
        <Text style={styles.subject}>{diagram.subject}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{diagram.targetBatch}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{diagram.description || "No description"}</Text>
      </View>

      <Text style={styles.sectionLabelMain}>Practice Websites</Text>

      <TouchableOpacity style={styles.linkBtn} onPress={() => openUrl(links.drawio)}>
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={styles.linkBtnText}>Open Draw.io</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={() => openUrl(links.creately)}>
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={styles.linkBtnText}>Open Creately</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={() => openUrl(links.lucidchart)}>
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={styles.linkBtnText}>Open Lucidchart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 28 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: 10, color: "#ef4444", fontWeight: "700" },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    textAlign: "center",
  },
  subject: {
    color: "#1d4ed8",
    fontWeight: "700",
    marginTop: 4,
  },
  badge: {
    marginTop: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { color: "#1d4ed8", fontWeight: "700" },

  section: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionLabel: {
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 6,
  },
  description: { color: "#334155", lineHeight: 20 },

  sectionLabelMain: {
    marginTop: 16,
    marginBottom: 10,
    color: "#334155",
    fontWeight: "800",
    fontSize: 16,
  },
  linkBtn: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  linkBtnText: { color: "#fff", fontWeight: "800" },
});
