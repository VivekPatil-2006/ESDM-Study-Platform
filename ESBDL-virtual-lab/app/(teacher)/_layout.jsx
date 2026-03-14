import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CUSTOM DRAWER ================= */

function CustomDrawerContent(props) {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);

  /* LOAD IMAGE FROM STORAGE */
  useEffect(() => {
    const loadImage = async () => {
      const image = await AsyncStorage.getItem("profileImage");
      setProfileImage(image);
    };
    loadImage();
  }, []);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>

      {/* PROFILE HEADER */}
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={{
          paddingVertical: 40,
          alignItems: "center",
          backgroundColor: "#0f172a",
          marginBottom: 10
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
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#1e293b",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10
            }}
          >
            <Ionicons name="person" size={40} color="#94a3b8" />
          </View>
        )}

        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          View Profile
        </Text>
      </TouchableOpacity>

      {/* Drawer Items */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function BackHeaderButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(teacher)/activate-quiz")}
      style={{ marginLeft: 14, padding: 4 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

function BackToStudentsButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(teacher)/students")}
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
      onPress={() => router.replace("/(teacher)/add-assignment")}
      style={{ marginLeft: 14, padding: 4 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

function BackToNotesButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/(teacher)/add-notes")}
      style={{ marginLeft: 14, padding: 4 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

/* ================= MAIN DRAWER ================= */

export default function TeacherLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#ffffff",

        drawerStyle: {
          backgroundColor: "#020617",
          width: 280
        },

        sceneContainerStyle: {
          backgroundColor: "#f8fafc"
        },

        drawerActiveBackgroundColor: "#1e293b",
        drawerActiveTintColor: "#38bdf8",
        drawerInactiveTintColor: "#cbd5f5",

        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -8
        },

        drawerItemStyle: {
          borderRadius: 10,
          marginHorizontal: 12,
          marginVertical: 4
        }
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="students"
        options={{
          title: "Students",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="add-assignment"
        options={{
          title: "Add Assignment",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="add-notes"
        options={{
          title: "Notes",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="activate-quiz"
        options={{
          title: "Activate Quiz",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
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

      <Drawer.Screen
        name="logout"
        options={{
          title: "Logout",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="upload-notes"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Upload Notes",
          swipeEnabled: false,
          headerLeft: () => <BackToNotesButton />
        }}
      />

      <Drawer.Screen
        name="quiz-details"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Quiz Details",
          swipeEnabled: false,
          headerLeft: () => <BackHeaderButton />
        }}
      />

      <Drawer.Screen
        name="create-quiz"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Create Quiz",
          swipeEnabled: false,
          headerLeft: () => <BackHeaderButton />
        }}
      />

      <Drawer.Screen
        name="student-details"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Student Details",
          swipeEnabled: false,
          headerLeft: () => <BackToStudentsButton />
        }}
      />

      <Drawer.Screen
        name="assignment-details"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Assignment Details",
          swipeEnabled: false,
          headerLeft: () => <BackToAssignmentsButton />
        }}
      />

      <Drawer.Screen
        name="create-assignment"
        options={{
          drawerItemStyle: { display: "none" },
          title: "Create Assignment",
          swipeEnabled: false,
          headerLeft: () => <BackToAssignmentsButton />
        }}
      />
    </Drawer>
  );
}
