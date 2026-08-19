import { renderToStaticMarkup } from "react-dom/server";
import MinecraftFormatted from "./format";

it("renders Minecraft colors and formatting from structured segments", () => {
  const markup = renderToStaticMarkup(
    <MinecraftFormatted
      value={{
        segments: [
          {
            text: "Hypixel",
            styles: ["color=#55ff55", "bold", "underline"],
          },
        ],
      }}
    />,
  );

  expect(markup).toContain("color:#55ff55");
  expect(markup).toContain("font-weight:700");
  expect(markup).toContain("text-decoration:underline");
  expect(markup).toContain("Hypixel");
});

it("renders server text as text rather than HTML", () => {
  const markup = renderToStaticMarkup(
    <MinecraftFormatted
      value={{
        segments: [{ text: "<img src=x>", styles: [] }],
      }}
    />,
  );

  expect(markup).toContain("&lt;img src=x&gt;");
  expect(markup).not.toContain("<img");
});

it("reproduces Minecraft wrapping markers without changing leading alignment", () => {
  const markup = renderToStaticMarkup(
    <MinecraftFormatted
      value={{
        segments: [
          { text: "        First line", styles: [] },
          { text: "          Second line", styles: [] },
        ],
      }}
    />,
  );

  expect(markup).toContain("        First line");
  expect(markup).toContain("\nSecond line");
});
