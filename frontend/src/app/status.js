import api from "./api";

export default async function status(ip, type) {
  const normalizedType = type.toLowerCase();
  const encodedIp = encodeURIComponent(ip);
  const response = await api.get(`/status/${normalizedType}/${encodedIp}`);
  if (!response.data) {
    throw new Error("The status API returned no data.");
  }

  if (normalizedType === "auto") {
    return {
      data: response.data.status,
      diagnostics: response.data.diagnostics,
      edition: response.data.edition || "auto",
    };
  }

  return {
    data: response.data,
    diagnostics: null,
    edition: normalizedType,
  };
}

export async function getDiagnostics(ip) {
  const response = await api.get(`/diagnostics/${encodeURIComponent(ip)}`);
  if (!response.data) {
    throw new Error("The diagnostics API returned no data.");
  }
  return response.data;
}
