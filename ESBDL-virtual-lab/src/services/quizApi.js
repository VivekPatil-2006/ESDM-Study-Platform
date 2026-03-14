import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "./api";

const getAuthHeaders = async (extraHeaders = {}) => {
  const token = await AsyncStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};

export async function fetchTeacherQuizzes() {
  const headers = await getAuthHeaders();
  const response = await API.get("/quizzes", { headers });
  return response.data.data || [];
}

export async function fetchTeacherQuizById(quizId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/quizzes/${quizId}`, { headers });
  return response.data.data;
}

export async function createTeacherQuiz(formData) {
  const headers = await getAuthHeaders({
    "Content-Type": "multipart/form-data",
  });

  const response = await API.post("/quizzes", formData, { headers });
  return response.data.data;
}

export async function updateTeacherQuizStatus(quizId, status) {
  const headers = await getAuthHeaders();
  const response = await API.patch(`/quizzes/${quizId}/status`, { status }, { headers });
  return response.data.data;
}

export async function fetchStudentActiveQuizzes() {
  const headers = await getAuthHeaders();
  const response = await API.get("/quizzes/student/active", { headers });
  return response.data.data || [];
}

export async function fetchStudentQuizResults() {
  const headers = await getAuthHeaders();
  const response = await API.get("/quizzes/student/results", { headers });
  return response.data.data || [];
}

export async function fetchStudentQuizById(quizId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/quizzes/student/${quizId}`, { headers });
  return response.data.data;
}

export async function submitStudentQuiz(quizId, answers) {
  const headers = await getAuthHeaders();
  const response = await API.post(`/quizzes/student/${quizId}/submit`, { answers }, { headers });
  return response.data.data;
}