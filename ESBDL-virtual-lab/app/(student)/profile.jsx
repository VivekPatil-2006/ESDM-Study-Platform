import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../src/services/api";

/* ===================================================== */

export default function Profile() {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profile, setProfile] = useState({
    photo: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    year: "",
    department: ""
  });

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await API.get("/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(res.data);

      // ✅ Cache image for drawer
      if (res.data.photo) {
        await AsyncStorage.setItem("profileImage", res.data.photo);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ================= PICK IMAGE ================= */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled) {
      const base64Image = result.assets[0].base64;

      setProfile((prev) => ({
        ...prev,
        photo: base64Image
      }));

      // ✅ Save immediately for drawer
      await AsyncStorage.setItem("profileImage", base64Image);
    }
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      await API.put(
        "/profile/update",
        {
          photo: profile.photo,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          year: profile.year,
          department: profile.department
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // ✅ Keep drawer image in sync
      if (profile.photo) {
        await AsyncStorage.setItem("profileImage", profile.photo);
      }

      Alert.alert("Success", "Profile updated successfully");
      setEdit(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const changePassword = async () => {
    try {
      const { oldPassword, newPassword, confirmPassword } = passwordForm;

      if (!oldPassword || !newPassword || !confirmPassword) {
        Alert.alert("Missing Fields", "Please fill previous, new and confirm password");
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert("Invalid Password", "New password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Mismatch", "New password and confirm password do not match");
        return;
      }

      setPasswordSaving(true);
      const token = await AsyncStorage.getItem("token");

      const res = await API.put(
        "/profile/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert("Success", res?.data?.message || "Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.msg || "Failed to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={edit ? pickImage : undefined}>
          {profile.photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${profile.photo}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#94a3b8" />
            </View>
          )}

          {edit && (
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {/* DETAILS CARD */}
      <View style={styles.card}>
        <ProfileInput
          label="Phone"
          value={profile.phone}
          editable={edit}
          onChange={(v) => setProfile({ ...profile, phone: v })}
        />

        <ProfileInput
          label="Address"
          value={profile.address}
          editable={edit}
          multiline
          onChange={(v) => setProfile({ ...profile, address: v })}
        />

        <ProfileInput
          label="Year"
          value={profile.year}
          editable={edit}
          onChange={(v) => setProfile({ ...profile, year: v })}
        />

        <ProfileInput
          label="Department"
          value={profile.department}
          editable={edit}
          onChange={(v) => setProfile({ ...profile, department: v })}
        />

        {/* ACTION BUTTONS */}
        {edit ? (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEdit(true)}
          >
            <Ionicons name="create-outline" size={20} color="#2563eb" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* FORGOT PASSWORD FACILITY */}
        <View style={styles.passwordSection}>
          <Text style={styles.passwordTitle}>Forgot Password / Change Password</Text>

          <ProfileInput
            label="Previous Password"
            value={passwordForm.oldPassword}
            editable
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, oldPassword: v }))}
            secureTextEntry
          />

          <ProfileInput
            label="New Password"
            value={passwordForm.newPassword}
            editable
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, newPassword: v }))}
            secureTextEntry
          />

          <ProfileInput
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            editable
            onChange={(v) => setPasswordForm((prev) => ({ ...prev, confirmPassword: v }))}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.changePasswordBtn, passwordSaving && { opacity: 0.7 }]}
            onPress={changePassword}
            disabled={passwordSaving}
          >
            {passwordSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="key-outline" size={18} color="#fff" />
                <Text style={styles.changePasswordText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ================= INPUT COMPONENT ================= */

function ProfileInput({ label, value, editable, onChange, multiline, secureTextEntry = false }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        onChangeText={onChange}
        placeholder={`Enter ${label}`}
        style={[
          styles.input,
          !editable && styles.disabledInput,
          multiline && { height: 80 }
        ]}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  profileImage: {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 3,
  borderColor: "#fff",
  marginBottom: 6,
},

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff"
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center"
  },

  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#2563eb",
    padding: 6,
    borderRadius: 20
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10
  },

  email: {
    color: "#c7d2fe",
    fontSize: 14,
    marginTop: 4
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 6
  },

  inputGroup: {
    marginBottom: 16
  },

  label: {
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "600"
  },

  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 15
  },

  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8"
  },

  editBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  editText: {
    color: "#2563eb",
    fontWeight: "700"
  },

  saveBtn: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15
  },

  passwordSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0"
  },

  passwordTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8
  },

  changePasswordBtn: {
    marginTop: 6,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },

  changePasswordText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700"
  }
});
