# Studio AI

Modern Next.js (App Router) + Tailwind CSS studio for AI image and video generation powered by the [OpenArt MCP server](https://mcp.openart.ai/mcp).

## Features

- Dark **Studio AI** workspace with mode switching:
  - Text-to-Image
  - Text-to-Video
  - Image-to-Video
- Prompt textarea with **Enhance Prompt with AI**
- Start Frame + Reference Image upload dropzones
- Video duration (5s / 10s) and quality (720p / 1080p)
- Credit balance header + Upgrade / Buy Credits flow
- Media gallery with video player, download, and copy-prompt
- Next.js API routes that call OpenArt tools via `@modelcontextprotocol/sdk`

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Description |
| --- | --- |
| `OPENART_ACCESS_TOKEN` | Bearer token for `https://mcp.openart.ai/mcp` |
| `OPENART_MCP_URL` | Optional MCP endpoint override |
| `OPENART_DEMO_FALLBACK` | `true`/`false`. Defaults to demo media when no token is set |

Without a live token, the app uses local free credits and demo media so the UI stays fully interactive.

## OpenArt MCP flow

1. API routes connect with `StreamableHTTPClientTransport`
2. Image: `nano-banana-2-lite` (`text2image` / `image2image`)
3. Video: `pixverseV6` (`text2video` / `image2video`)
4. Uploads: `openart_upload_sign` → PUT bytes → optional metadata
5. Completion: `openart_creation_wait` (videos may need multiple waits)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
