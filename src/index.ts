interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Color Pizza MCP — names hex colors using human-friendly color-name lists.
 * Wraps the keyless Color Pizza API (https://api.color.pizza/v1).
 */


const BASE = 'https://api.color.pizza/v1';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'name_colors',
    description:
      'Find the nearest human-friendly color name for one or more hex colors. Pass hex codes (with or without leading #), comma-separated for several at once. Returns the closest named color for each input, with its canonical hex, RGB, and perceptual distance. Optionally pick a naming list (e.g. "wikipedia", "ntc", "x11", "html", "japaneseTraditional", "leCorbusier", "bestOf"); defaults to "default". Use list_palettes to see all available lists.',
    inputSchema: {
      type: 'object',
      properties: {
        hex: {
          type: 'string',
          description: 'One or more hex colors, comma-separated. With or without #. e.g. "ff0000" or "#ff0000,#00ff00".',
        },
        list: {
          type: 'string',
          description: 'Color-name list to use. Default "default". Other options: wikipedia, ntc, x11, html, japaneseTraditional, leCorbusier, bestOf, etc.',
        },
      },
      required: ['hex'],
    },
  },
  {
    name: 'search_color_names',
    description:
      'Search named colors whose name contains a substring (e.g. "blue", "rose", "teal"). Returns matching color names with their hex codes. Optionally restrict to a specific naming list (see list_palettes).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Substring to search color names for, e.g. "blue".' },
        list: { type: 'string', description: 'Optional color-name list to search within. Default "default".' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_palettes',
    description:
      'List all available color-name lists (palettes) with their titles, descriptions, color counts, and licenses. Use this to discover valid values for the "list" argument of name_colors and search_color_names.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'name_colors':
      return nameColors(args);
    case 'search_color_names':
      return searchColorNames(args);
    case 'list_palettes':
      return listPalettes();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function nameColors(args: Record<string, unknown>): Promise<unknown> {
  const raw = typeof args.hex === 'string' ? args.hex : '';
  const hexes = raw
    .split(',')
    .map((h) => h.replace(/#/g, '').trim().toLowerCase())
    .filter((h) => /^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(h));

  if (hexes.length === 0) {
    return { error: 'provide hex color codes, e.g. ff0000 or #00ff00' };
  }

  const list = typeof args.list === 'string' && args.list.trim() ? args.list.trim() : 'default';
  const url = `${BASE}/?values=${encodeURIComponent(hexes.join(','))}&list=${encodeURIComponent(list)}`;
  const data = await getJson(url);
  if (data && typeof data === 'object' && 'error' in data) return data;

  const d = data as { paletteTitle?: string; colors?: unknown[] };
  const colors = (d.colors ?? []).map((c) => {
    const col = c as Record<string, unknown>;
    return {
      requestedHex: col.requestedHex,
      name: col.name,
      hex: col.hex,
      rgb: col.rgb,
      distance: col.distance,
    };
  });
  return { paletteTitle: d.paletteTitle ?? null, colors };
}

async function searchColorNames(args: Record<string, unknown>): Promise<unknown> {
  const name = typeof args.name === 'string' ? args.name.trim() : '';
  if (!name) return { error: 'provide a name substring to search, e.g. "blue"' };

  let url = `${BASE}/names/?name=${encodeURIComponent(name)}`;
  if (typeof args.list === 'string' && args.list.trim()) {
    url += `&list=${encodeURIComponent(args.list.trim())}`;
  }
  const data = await getJson(url);
  if (data && typeof data === 'object' && 'error' in data) return data;

  const d = data as { colors?: unknown[] };
  const colors = (d.colors ?? []).map((c) => {
    const col = c as Record<string, unknown>;
    return { name: col.name, hex: col.hex };
  });
  return { count: colors.length, colors };
}

async function listPalettes(): Promise<unknown> {
  return getJson(`${BASE}/lists/`);
}

async function getJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (!res.ok) {
      const body = await res.text().then((t) => t.slice(0, 200)).catch(() => '');
      return { error: `Color Pizza: ${res.status} ${body}` };
    }
    return await res.json();
  } catch (e) {
    return { error: `Color Pizza request failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
