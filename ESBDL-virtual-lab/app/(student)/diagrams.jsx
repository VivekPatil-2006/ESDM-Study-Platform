import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Diagrams() {
  // 🧩 SAMPLE DIAGRAMS (Shared by Teacher)
  const sampleDiagrams = [
    {
      id: "1",
      title: "UML Class Diagram",
      subject: "Software Engineering",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/9/93/UML_class_diagram_example.png"
    },
    {
      id: "2",
      title: "ER Diagram – Student DB",
      subject: "Database Systems",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/ER_Diagram_MMORPG.png"
    },
    {
      id: "3",
      title: "Flowchart – Login Process",
      subject: "System Design",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/1/1f/Flowchart_example.svg"
    }
  ];

  // 🛠 PRACTICE TOOLS
  const tools = [
    {
      id: "t1",
      name: "Draw.io (diagrams.net)",
      desc: "UML, ER, Flowcharts",
      url: "https://app.diagrams.net/"
    },
    {
      id: "t2",
      name: "Creately",
      desc: "Flowcharts & UML",
      url: "https://creately.com/diagram-type/uml/"
    },
    {
      id: "t3",
      name: "Lucidchart",
      desc: "ER & UML Diagrams",
      url: "https://www.lucidchart.com/pages/"
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>🧠 Diagram Practice</Text>
      <Text style={styles.subheading}>
        View sample diagrams & practice on tools
      </Text>

      {/* SAMPLE DIAGRAMS */}
      <Text style={styles.sectionTitle}>Sample Diagrams</Text>

      <FlatList
        data={sampleDiagrams}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.diagramCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.diagramImage}
              resizeMode="contain"
            />
            <Text style={styles.diagramTitle}>{item.title}</Text>
            <Text style={styles.diagramSubject}>{item.subject}</Text>
          </View>
        )}
      />

      {/* PRACTICE TOOLS */}
      <Text style={styles.sectionTitle}>Practice Tools</Text>

      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={styles.toolCard}
          onPress={() => Linking.openURL(tool.url)}
        >
          <Ionicons name="open-outline" size={22} color="#2563eb" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.toolName}>{tool.name}</Text>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a"
  },

  subheading: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 20
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 20
  },

  diagramCard: {
    backgroundColor: "#fff",
    width: 240,
    borderRadius: 18,
    padding: 14,
    marginRight: 14,
    elevation: 4
  },

  diagramImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f8fafc",
    borderRadius: 12
  },

  diagramTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a"
  },

  diagramSubject: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2
  },

  toolCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3
  },

  toolName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a"
  },

  toolDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2
  }
});
