import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const fetchTeacherDashboardAnalytics = async () => {
  const headers = await authHeaders();
  const res = await API.get("/dashboard/teacher", { headers });
  return res.data.data;
};

export const fetchStudentDashboardAnalytics = async () => {
  const headers = await authHeaders();
  const res = await API.get("/dashboard/student", { headers });
  return res.data.data;
};
