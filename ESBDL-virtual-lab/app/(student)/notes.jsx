import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Notes() {

  // 📘 SAMPLE NOTES DATA
  const notesData = [
    {
      id: "1",
      title: "Introduction to ESBDL",
      description: "Overview of Embedded Systems and Deep Learning concepts.",
      subject: "ESBDL",
      teacher: "Dr. Sharma",
      fileType: "PDF"
    },
    {
      id: "2",
      title: "Microcontrollers Basics",
      description: "Architecture, memory, and peripherals.",
      subject: "Embedded Systems",
      teacher: "Prof. Patil",
      fileType: "PPT"
    },
    {
      id: "3",
      title: "Sensors & Actuators",
      description: "Types of sensors and their working principles.",
      subject: "IoT",
      teacher: "Ms. Kulkarni",
      fileType: "PDF"
    },
    {
      id: "4",
      title: "Neural Networks Fundamentals",
      description: "Perceptron, activation functions, and training.",
      subject: "Deep Learning",
      teacher: "Dr. Mehta",
      fileType: "PDF"
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📘 Notes</Text>
      <Text style={styles.subheading}>
        Study material shared by your teachers
      </Text>

      <FlatList
        data={notesData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => <NoteCard note={item} />}
      />
    </View>
  );
}

/* ================= NOTE CARD ================= */

function NoteCard({ note }) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.subject}>{note.subject}</Text>
        <View style={styles.fileBadge}>
          <Ionicons name="document-outline" size={12} color="#2563eb" />
          <Text style={styles.fileText}>{note.fileType}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.desc}>{note.description}</Text>

      {/* Meta */}
      <View style={styles.metaRow}>
        <Ionicons name="person-outline" size={14} color="#64748b" />
        <Text style={styles.metaText}>{note.teacher}</Text>
      </View>

      {/* Action */}
      <TouchableOpacity style={styles.downloadBtn}>
        <Ionicons name="download-outline" size={18} color="#fff" />
        <Text style={styles.downloadText}>Download Notes</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f1f5f9"
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subheading: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    marginTop: 4
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 4
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  subject: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb"
  },

  fileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },

  fileText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb"
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 10
  },

  desc: {
    fontSize: 14,
    marginTop: 4,
    color: "#475569"
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },

  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#64748b"
  },

  downloadBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  downloadText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14
  }
});
