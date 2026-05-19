import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { WebView } from "react-native-webview";

import { fetchStudentDiagrams } from "../../src/services/diagramApi";

const openUrl = async (url) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Error", "Unable to open link.");
  }
};

export default function Diagrams() {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");

  const loadDiagrams = async () => {
    try {
      const data = await fetchStudentDiagrams();
      setDiagrams(data);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to load diagrams";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDiagrams();
    }, [])
  );

  const openDiagram = (item) => {
    const mimeType = item.imageMimeType || "image/jpeg";
    setViewerTitle(item.title || "Diagram Preview");
    setViewerUri(`data:${mimeType};base64,${item.imageData}`);
    setViewerVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDiagrams();
          }}
        />
      }
    >
      <Text style={styles.heading}>Diagram Practice</Text>
      <Text style={styles.subheading}>View teacher diagrams and practice using your preferred tool.</Text>

      {diagrams.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No diagrams available for your class yet.</Text>
        </View>
      ) : (
        diagrams.map((item) => {
          const links = item.practiceLinks || {};

          return (
            <View key={item._id} style={styles.card}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => openDiagram(item)}>
                <Image
                  source={{ uri: `data:${item.imageMimeType || "image/jpeg"};base64,${item.imageData}` }}
                  style={styles.diagramImage}
                  resizeMode="cover"
                />
                <View style={styles.zoomHint}>
                  <Ionicons name="resize-outline" size={16} color="#fff" />
                  <Text style={styles.zoomHintText}>Tap to view full screen</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subject}>{item.subject}</Text>
                {!!item.description && <Text style={styles.description}>{item.description}</Text>}

                <View style={styles.toolRow}>
                  <TouchableOpacity style={styles.toolBtn} onPress={() => openUrl(links.drawio)}>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={styles.toolBtnText}>Draw.io</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.toolBtn} onPress={() => openUrl(links.creately)}>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={styles.toolBtnText}>Creately</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.toolBtn} onPress={() => openUrl(links.lucidchart)}>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                    <Text style={styles.toolBtnText}>Lucidchart</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.targetBatch}</Text>
              </View>
            </View>
          );
        })
      )}

      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              style={styles.viewerCloseBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {viewerTitle}
            </Text>
            <View style={styles.viewerHeaderSpacer} />
          </View>

          {viewerUri ? (
            <View style={styles.viewerWebWrap}>
              <WebView
                source={{
                  html: `
                    <!doctype html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes" />
                        <style>
                          html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            background: #0f172a;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: auto;
                          }
                          img {
                            max-width: 100%;
                            height: auto;
                            object-fit: contain;
                            -webkit-user-select: none;
                            user-select: none;
                          }
                        </style>
                      </head>
                      <body>
                        <img src="${viewerUri}" />
                      </body>
                    </html>
                  `,
                }}
                originWhitelist={["*"]}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563eb" />
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Unable to load image</Text>
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
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  subheading: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    color: "#64748b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  diagramImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#e2e8f0",
  },
  zoomHint: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(15,23,42,0.78)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  zoomHintText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    padding: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  subject: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 3,
  },
  description: {
    marginTop: 8,
    color: "#475569",
    lineHeight: 20,
  },
  toolRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolBtn: {
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toolBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  viewerHeader: {
    height: 64,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  viewerCloseBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
  },
  viewerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginHorizontal: 12,
  },
  viewerHeaderSpacer: {
    width: 36,
    height: 36,
  },
  viewerWebWrap: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
});
