import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "./api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchStudents({ search = "", batch = "All" } = {}) {
  const headers = await getAuthHeaders();
  const response = await API.get("/students", {
    headers,
    params: {
      search,
      batch,
    },
  });

  return response.data.data || [];
}

export async function fetchStudentById(studentId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/students/${studentId}`, { headers });
  return response.data.data;
}

export async function fetchStudentAnalytics(studentId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/students/${studentId}/analytics`, { headers });
  return response.data.data;
}