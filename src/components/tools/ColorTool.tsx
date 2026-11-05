import { useState } from "react";
import { hslCss, hslToRgb, parseHex, parseHsl, parseRgb, rgbCss, rgbToHex, rgbToHsl } from "../../lib/colorConvert";
import type { Rgb } from "../../lib/colorConvert";

/* HEX, RGB and HSL color converter. Runs in the browser; nothing is sent anywhere. */

type Source = "hex" | "rgb" | "hsl" | "pick";

export default function ColorTool({ hex: h0 }: { hex: string }) {
  const start = parseHex(h0) ?? { r: 255, g: 136, b: 0 };
  const [rgb, setRgb] = useState<Rgb>(start);
  const [text, setText] = useState({ hex: rgbToHex(start), rgb: rgbCss(start), hsl: hslCss(rgbToHsl(start)) });
  const [bad, setBad] = useState<"" | "hex" | "rgb" | "hsl">("");

  function apply(next: Rgb, source: Source) {
    setRgb(next);
    setBad("");
    setText((t) => ({
      hex: source === "hex" ? t.hex : rgbToHex(next),
      rgb: source === "rgb" ? t.rgb : rgbCss(next),
      hsl: source === "hsl" ? t.hsl : hslCss(rgbToHsl(next)),
    }));
  }

  function edit(field: "hex" | "rgb" | "hsl", value: string) {
    setText((t) => ({ ...t, [field]: value }));
    const parsed = field === "hex" ? parseHex(value) : field === "rgb" ? parseRgb(value) : (() => { const h = parseHsl(value); return h ? hslToRgb(h) : null; })();
    if (parsed) apply(parsed, field);
    else setBad(field);
  }

  const field = (id: "hex" | "rgb" | "hsl", label: string) => (
    <div className="ic-field calc-row">
      <label htmlFor={`col-${id}`}>{label}</label>
      <input id={`col-${id}`} type="text" autoComplete="off" spellCheck={false} value={text[id]} onChange={(e) => edit(id, e.target.value)} aria-invalid={bad === id} />
    </div>
  );

  return (
    <div className="calc land unit">
      <form className="calc-card" onSubmit={(e) => e.preventDefault()} aria-label="Color inputs">
        <h2 className="calc-bar">Enter a color</h2>
        <div className="calc-form">
          <div className="ic-field calc-row">
            <label htmlFor="col-pick">Pick a color</label>
            <input id="col-pick" type="color" value={rgbToHex(rgb).toLowerCase()} onChange={(e) => { const p = parseHex(e.target.value); if (p) apply(p, "pick"); }} />
          </div>
          {field("hex", "HEX")}
          {field("rgb", "RGB")}
          {field("hsl", "HSL")}
        </div>
      </form>
      <section className="calc-card" aria-live="polite" aria-label="Result">
        <h2 className="calc-bar calc-bar-result">Result</h2>
        {bad ? (
          <p className="calc-error" role="alert">
            {bad === "hex" ? "Enter a HEX color such as #FF8800 or #F80." : bad === "rgb" ? "Enter RGB values from 0 to 255, such as rgb(255, 136, 0)." : "Enter HSL such as hsl(32, 100%, 50%): hue in degrees, saturation and lightness 0 to 100%."}
          </p>
        ) : (
          <div className="calc-big">
            <div style={{ height: 72, borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", background: rgbToHex(rgb) }} role="img" aria-label={`Color swatch ${rgbToHex(rgb)}`} />
            <div className="calc-label" style={{ marginTop: 12 }}>HEX {rgbToHex(rgb)}</div>
            <div className="calc-value land-value">{rgbCss(rgb)}</div>
            <div className="calc-label">{hslCss(rgbToHsl(rgb))}</div>
          </div>
        )}
      </section>
    </div>
  );
}
