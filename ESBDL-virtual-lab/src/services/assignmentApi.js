import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

/* ─── List assignments (optional server-side search) ─── */
export const fetchAssignments = async ({ search = "" } = {}) => {
  const headers = await authHeaders();
  const params = search.trim() ? { search: search.trim() } : {};
  const res = await API.get("/assignments", { headers, params });
  return res.data.data || [];
};

/* ─── Single assignment with attachments + submissions ─── */
export const fetchAssignmentById = async (id) => {
  const headers = await authHeaders();
  const res = await API.get(`/assignments/${id}`, { headers });
  return res.data.data;
};

/* ─── Create a new assignment ─── */
export const createAssignment = async (payload) => {
  const headers = await authHeaders();
  const res = await API.post("/assignments", payload, { headers });
  return res.data.data;
};

/* ─── Student: list allowed assignments ─── */
export const fetchStudentAssignments = async () => {
  const headers = await authHeaders();
  const res = await API.get("/assignments/student", { headers });
  return res.data.data || [];
};

/* ─── Student: single assignment details ─── */
export const fetchStudentAssignmentById = async (id) => {
  const headers = await authHeaders();
  const res = await API.get(`/assignments/student/${id}`, { headers });
  return res.data.data;
};
