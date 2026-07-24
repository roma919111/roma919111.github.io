import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const OPENART_MCP_URL = process.env.OPENART_MCP_URL ?? "https://mcp.openart.ai/mcp";

export function getOpenArtToken(): string | undefined {
  return (
    process.env.OPENART_ACCESS_TOKEN ||
    process.env.OPENART_API_KEY ||
    process.env.OPENART_TOKEN ||
    undefined
  );
}

export function isDemoFallbackEnabled(): boolean {
  if (process.env.OPENART_DEMO_FALLBACK === "false") return false;
  if (process.env.OPENART_DEMO_FALLBACK === "true") return true;
  return !getOpenArtToken();
}

type ToolResult = {
  content?: Array<{ type?: string; text?: string; [key: string]: unknown }>;
  structuredContent?: unknown;
  isError?: boolean;
};

function extractTextPayload(result: ToolResult): unknown {
  if (result.structuredContent) return result.structuredContent;

  const texts = (result.content ?? [])
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text as string);

  if (texts.length === 0) return result;

  const joined = texts.join("\n").trim();
  try {
    return JSON.parse(joined);
  } catch {
    // Some tools wrap JSON in markdown fences
    const fenced = joined.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        /* fall through */
      }
    }
    return { text: joined };
  }
}

export async function withOpenArtClient<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const token = getOpenArtToken();
  if (!token) {
    throw new Error(
      "Missing OPENART_ACCESS_TOKEN. Set a Bearer token to call the OpenArt MCP server.",
    );
  }

  const client = new Client({ name: "studio-ai", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(OPENART_MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  try {
    await client.connect(transport);
    return await fn(client);
  } finally {
    try {
      await client.close();
    } catch {
      /* ignore close errors */
    }
  }
}

export async function callOpenArtTool<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  return withOpenArtClient(async (client) => {
    const result = (await client.callTool({
      name,
      arguments: args,
    })) as ToolResult;

    if (result.isError) {
      const payload = extractTextPayload(result);
      const message =
        typeof payload === "object" &&
        payload &&
        "text" in payload &&
        typeof (payload as { text: unknown }).text === "string"
          ? (payload as { text: string }).text
          : JSON.stringify(payload);
      throw new Error(message || `OpenArt tool ${name} failed`);
    }

    return extractTextPayload(result) as T;
  });
}
