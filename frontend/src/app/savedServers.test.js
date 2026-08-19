import { removeSavedServer, toggleSavedServer } from "./savedServers";

beforeEach(() => {
  window.localStorage.clear();
});

it("saves and removes a server locally", () => {
  expect(
    toggleSavedServer({
      ip: "mc.hypixel.net",
      name: "Hypixel",
      type: "auto",
    }),
  ).toBe(true);

  const saved = JSON.parse(window.localStorage.getItem("torch.savedServers"));
  expect(saved).toEqual([
    {
      id: "auto:mc.hypixel.net",
      ip: "mc.hypixel.net",
      name: "Hypixel",
      type: "auto",
    },
  ]);

  removeSavedServer("auto:mc.hypixel.net");
  expect(JSON.parse(window.localStorage.getItem("torch.savedServers"))).toEqual(
    [],
  );
});

it("does not duplicate an existing saved server", () => {
  const server = {
    ip: "mc.hypixel.net",
    name: "Hypixel",
    type: "auto",
  };

  toggleSavedServer(server);
  expect(toggleSavedServer(server)).toBe(false);
  expect(JSON.parse(window.localStorage.getItem("torch.savedServers"))).toEqual(
    [],
  );
});
