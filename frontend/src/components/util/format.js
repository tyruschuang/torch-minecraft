import { useEffect, useRef } from "react";

const obfuscatedCharacters =
  "abcdeghmnopqrsuwxyABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#$%&";

export default function MinecraftFormatted(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const obfuscated = containerRef.current?.getElementsByClassName(
      "minecraft-obfuscated",
    );

    if (prefersReducedMotion.matches || !obfuscated?.length) {
      return undefined;
    }

    function update() {
      for (let i = 0; i < obfuscated.length; i++) {
        let value = "";
        for (let j = 0; j < obfuscated[i].innerText.length; j++) {
          value += obfuscatedCharacters.charAt(
            Math.floor(Math.random() * obfuscatedCharacters.length),
          );
        }
        obfuscated[i].innerText = value;
      }
    }

    let raf;
    let then = performance.now();
    const step = (now) => {
      const deltaTime = now - then;
      if (deltaTime > 50) {
        update();
        then = now;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [props.html]);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: props.html }} />
  );
}
