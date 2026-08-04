# mcp-color-pizza

Color Pizza MCP — names hex colors using human-friendly color-name lists.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `name_colors` | Find the nearest human-friendly color name for one or more hex colors. Pass hex codes (with or without leading #), comma-separated for several at once. Returns the closest named color for each input, with its canonical hex, RGB, and perceptual distance. Optionally pick a naming list (e.g. "wikipedia", "ntc", "x11", "html", "japaneseTraditional", "leCorbusier", "bestOf"); defaults to "default". Use list_palettes to see all available lists. |
| `search_color_names` | Search named colors whose name contains a substring (e.g. "blue", "rose", "teal"). Returns matching color names with their hex codes. Optionally restrict to a specific naming list (see list_palettes). |
| `list_palettes` | List all available color-name lists (palettes) with their titles, descriptions, color counts, and licenses. Use this to discover valid values for the "list" argument of name_colors and search_color_names. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "color-pizza": {
      "url": "https://gateway.pipeworx.io/color-pizza/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Color Pizza data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
