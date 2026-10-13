/**
 * Tiny, dependency-free XML reader for OOXML parts. Element and attribute names are stored without
 * their namespace prefix (w:p -> p, r:embed -> embed). DOCTYPE declarations are rejected so entity
 * expansion attacks are impossible; only the five predefined and numeric entities are decoded.
 */

export interface XmlNode {
  name: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
}

const MAX_DEPTH = 200;
const local = (name: string) => name.slice(name.indexOf(":") + 1);

function decode(value: string): string {
  if (!value.includes("&")) return value;
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|amp|quot|apos);/g, (_, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    }
    return { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" }[e] ?? "";
  });
}

export function parseXml(source: string): XmlNode {
  const root: XmlNode = { name: "#root", attrs: {}, children: [], text: "" };
  const stack: XmlNode[] = [root];
  const attrPattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let i = source.charCodeAt(0) === 0xfeff ? 1 : 0;

  while (i < source.length) {
    const lt = source.indexOf("<", i);
    const top = stack[stack.length - 1];
    if (lt < 0) {
      top.text += decode(source.slice(i));
      break;
    }
    if (lt > i) top.text += decode(source.slice(i, lt));

    if (source.startsWith("<!--", lt)) {
      const end = source.indexOf("-->", lt + 4);
      if (end < 0) throw new Error("unterminated comment");
      i = end + 3;
    } else if (source.startsWith("<![CDATA[", lt)) {
      const end = source.indexOf("]]>", lt + 9);
      if (end < 0) throw new Error("unterminated CDATA");
      top.text += source.slice(lt + 9, end);
      i = end + 3;
    } else if (source.startsWith("<?", lt)) {
      const end = source.indexOf("?>", lt + 2);
      if (end < 0) throw new Error("unterminated declaration");
      i = end + 2;
    } else if (source.startsWith("<!", lt)) {
      throw new Error("DOCTYPE is not allowed");
    } else if (source[lt + 1] === "/") {
      const end = source.indexOf(">", lt);
      if (end < 0 || stack.length < 2) throw new Error("unbalanced tag");
      stack.pop();
      i = end + 1;
    } else {
      const end = source.indexOf(">", lt);
      if (end < 0) throw new Error("unterminated tag");
      const selfClosing = source[end - 1] === "/";
      const body = source.slice(lt + 1, selfClosing ? end - 1 : end);
      const nameEnd = body.search(/[\s]/);
      const rawName = nameEnd < 0 ? body : body.slice(0, nameEnd);
      const node: XmlNode = { name: local(rawName), attrs: {}, children: [], text: "" };
      if (nameEnd >= 0) {
        attrPattern.lastIndex = 0;
        let m: RegExpExecArray | null;
        const rest = body.slice(nameEnd);
        while ((m = attrPattern.exec(rest))) node.attrs[local(m[1])] = decode(m[2] ?? m[3] ?? "");
      }
      top.children.push(node);
      if (!selfClosing) {
        if (stack.length > MAX_DEPTH) throw new Error("document too deeply nested");
        stack.push(node);
      }
      i = end + 1;
    }
  }
  if (stack.length !== 1) throw new Error("unclosed element");
  const element = root.children[0];
  if (!element) throw new Error("empty document");
  return element;
}

export const child = (node: XmlNode | undefined, name: string): XmlNode | undefined => node?.children.find((c) => c.name === name);
export const kids = (node: XmlNode | undefined, name: string): XmlNode[] => node?.children.filter((c) => c.name === name) ?? [];
