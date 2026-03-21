import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "./api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchTeacherVideos() {
  const headers = await getAuthHeaders();
  const response = await API.get("/videos/teacher", { headers });
  return response.data.data || [];
}

export async function fetchTeacherVideoById(videoId) {
  const headers = await getAuthHeaders();
  const response = await API.get(`/videos/teacher/${videoId}`, { headers });
  return response.data.data;
}

export async function createTeacherVideo(payload) {
  const headers = await getAuthHeaders();
  const response = await API.post("/videos", payload, { headers });
  return response.data.data;
}

export async function fetchStudentVideos() {
  const headers = await getAuthHeaders();
  const response = await API.get("/videos/student", { headers });
  return response.data.data || [];
}
