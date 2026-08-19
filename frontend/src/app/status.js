import api from "./api";

export default async function status(ip, type) {
  const normalizedType = type.toLowerCase();
  const response = await api.get(`/status/${normalizedType}/${ip}`);
  if (!response.data) {
    throw new Error("The status API returned no data.");
  }

  return response.data;
}
