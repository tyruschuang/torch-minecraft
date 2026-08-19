import { useEffect, useState } from "react";

const storageKey = "torch.savedServers";
const updateEvent = "torch:saved-servers-updated";
const savedServerLimit = 12;

function readSavedServers() {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(value)) return [];

    return value
      .filter(
        (server) =>
          typeof server?.ip === "string" &&
          ["auto", "java", "bedrock"].includes(server?.type),
      )
      .slice(0, savedServerLimit);
  } catch {
    return [];
  }
}

function writeSavedServers(servers) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(servers));
    window.dispatchEvent(new Event(updateEvent));
    return true;
  } catch {
    return false;
  }
}

function serverId(type, ip) {
  return `${type}:${ip.trim().toLowerCase()}`;
}

export function toggleSavedServer({ ip, name, type }) {
  const savedServers = readSavedServers();
  const id = serverId(type, ip);
  const existingIndex = savedServers.findIndex((server) => server.id === id);

  if (existingIndex >= 0) {
    savedServers.splice(existingIndex, 1);
    return writeSavedServers(savedServers) ? false : true;
  }

  savedServers.unshift({
    id,
    ip: ip.trim(),
    name: name?.trim() || ip.trim(),
    type,
  });
  return writeSavedServers(savedServers.slice(0, savedServerLimit));
}

export function removeSavedServer(id) {
  writeSavedServers(readSavedServers().filter((server) => server.id !== id));
}

export function useSavedServers() {
  const [savedServers, setSavedServers] = useState(readSavedServers);

  useEffect(() => {
    const update = () => setSavedServers(readSavedServers());
    window.addEventListener(updateEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(updateEvent, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return savedServers;
}
