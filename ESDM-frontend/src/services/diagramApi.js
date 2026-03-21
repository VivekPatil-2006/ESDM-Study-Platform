import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "./api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchTeacherDiagrams() {
  const headers = await getAuthHeaders();
  const response = await API.get("/diagrams/teacher", { headers });
  return response.data.data || [];
}

export async function fetchTeacherDiagramById(diagramId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/diagrams/teacher/${diagramId}`, { headers });
  return response.data.data;
}

export async function createTeacherDiagram(payload) {
  const headers = await getAuthHeaders();
  const response = await API.post("/diagrams", payload, { headers });
  return response.data.data;
}

export async function fetchStudentDiagrams() {
  const headers = await getAuthHeaders();
  const response = await API.get("/diagrams/student", { headers });
  return response.data.data || [];
}
