import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentScrollView,
  DrawerItemList
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

/* ================= CUSTOM DRAWER ================= */

function CustomDrawer(props) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);

  const loadProfileImage = async () => {
    const img = await AsyncStorage.getItem("profileImage");
    setProfileImage(img || null);
  };

  useEffect(() => {
    loadProfileImage();

    const unsubscribe = props.navigation.addListener("focus", () => {
      loadProfileImage();
    });

    return unsubscribe;
  }, [props.navigation]);

  const goToProfile = () => {
    props.navigation.closeDrawer();
    router.push("/(student)/profile");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      
      {/* PROFILE HEADER */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={goToProfile}
        style={{
          paddingVertical: 40,
          alignItems: "center",
          backgroundColor: "#0f172a",
        }}
      >
        {profileImage ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${profileImage}` }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 3,
              borderColor: "#fff",
              marginBottom: 10
            }}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={90} color="#94a3b8" />
        )}

        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          View Profile
        </Text>
      </TouchableOpacity>

      {/* Drawer Menu */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function BackToQuizButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(student)/quizzes")}
      style={{ marginLeft: 14, padding: 4 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

function BackToAssignmentsButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(student)/assignments")}
      style={{ marginLeft: 14, padding: 4 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

/* ================= STUDENT LAYOUT ================= */

export default function StudentLayout() {
  const router = useRouter();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#fff",

        drawerStyle: {
          width: 250,
          backgroundColor: "#020617"
        },

        sceneContainerStyle: {
          backgroundColor: "#f8fafc"
        },

        drawerActiveBackgroundColor: "#1e293b",
        drawerActiveTintColor: "#38bdf8",
        drawerInactiveTintColor: "#cbd5f5",

        drawerLabelStyle: {
          marginLeft: -8,
          fontSize: 16,
          fontWeight: "600"
        },

        drawerItemStyle: {
          borderRadius: 10,
          marginHorizontal: 12,
          marginVertical: 4
        }
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="assignments"
        options={{
          title: "Assignments",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="notes"
        options={{
          title: "Notes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="quizzes"
        options={{
          title: "Quizzes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="diagrams"
        options={{
          title: "Diagram Practice",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="brush-outline" size={size} color={color} />
          )
        }}
      />

      {/* PROFILE SCREEN (hidden but accessible) */}
      <Drawer.Screen
        name="profile"
        options={{
          drawerItemStyle: { display: "none" }
        }}
      />

      {/* LOGOUT */}
      <Drawer.Screen
        name="logout"
        options={{
          title: "Logout",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )
        }}
        listeners={{
          focus: () => router.replace("/login")
        }}
      />

      <Drawer.Screen
        name="take-quiz"
        options={{
          title: "Take Quiz",
          drawerItemStyle: { display: "none" },
          swipeEnabled: false,
          headerLeft: () => <BackToQuizButton />
        }}
      />

      <Drawer.Screen
        name="assignment-details"
        options={{
          title: "Assignment Details",
          drawerItemStyle: { display: "none" },
          swipeEnabled: false,
          headerLeft: () => <BackToAssignmentsButton />
        }}
      />
    </Drawer>
  );
}
//