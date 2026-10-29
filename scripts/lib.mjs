import { readFile } from 'node:fs/promises';

export const root = new URL('../', import.meta.url);
export const read = (path) => readFile(new URL(path, root), 'utf8');
export const json = async (path) => JSON.parse(await read(path));
export const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const svg = (icon, named = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${named ? 'role="img"' : 'aria-hidden="true" focusable="false"'}>${named ? `<title>${escape(icon.label)}</title>` : ''}${icon.body}</svg>`;
export const contrast = (a, b) => {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
};

// This intentionally small renderer accepts the authored subset only: headings,
// paragraphs, unordered lists, pipe tables, fenced code, inline code and links.
// Raw HTML is escaped. Links are restricted to HTTPS and local standard files.
export function markdown(source) {
  const inline = (line) => {
    const protectedText = [];
    const protect = (html) => `\u0000${protectedText.push(html) - 1}\u0000`;
    const encoded = line.replace(/`([^`]+)`/g, (_, code) => protect(`<code>${escape(code)}</code>`))
      .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label, url) => {
        const local = url.match(/^([a-z0-9-]+)\.md$/);
        if (!local && !/^https:\/\//.test(url)) throw new Error(`Unsupported Markdown link: ${url}`);
        return protect(`<a href="${escape(local ? `#/standards/${local[1]}` : url)}">${escape(label)}</a>`);
      });
    return escape(encoded).replace(/\u0000(\d+)\u0000/g, (_, n) => protectedText[Number(n)]);
  };
  const lines = source.split('\n');
  const result = [];
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((v) => v.trim());
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      if (i === lines.length) throw new Error('Unclosed Markdown fence');
      i++;
      result.push(`<pre tabindex="0"><code>${escape(code.join('\n'))}</code></pre>`);
    } else if (/^#{1,3} /.test(line)) {
      const [, marks, title] = line.match(/^(#{1,3}) (.+)$/);
      result.push(`<h${marks.length}>${inline(title)}</h${marks.length}>`);
      i++;
    } else if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i + 1] || '')) {
      const headers = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]));
      result.push(`<div class="table-scroll" role="region" aria-label="规范参数表" tabindex="0"><table><thead><tr>${headers.map((v) => `<th scope="col">${inline(v)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v) => `<td>${inline(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) items.push(`<li>${inline(lines[i++].slice(2))}</li>`);
      result.push(`<ul>${items.join('')}</ul>`);
    } else {
      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !/^(#|\||- |```)/.test(lines[i])) paragraph.push(lines[i++]);
      if (!paragraph.length) throw new Error(`Unsupported Markdown: ${line}`);
      result.push(`<p>${inline(paragraph.join(' '))}</p>`);
    }
  }
  return result.join('\n');
}
