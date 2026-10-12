import type { MetadataRoute } from 'next'

/**
 * robots — explicitly welcome AI crawlers and assistants.
 *
 * Groovemap is built to be read by LLMs: the catalog is public, machine-readable
 * (REST API under /api/v1, MCP server, llms.txt / llms-full.txt) and safe to
 * quote with attribution. No disallowed paths — everything on this site is
 * meant to be surfaced.
 */
export default function robots(): MetadataRoute.Robots {
  const friendlyAI = [
    'GPTBot',
    'ClaudeBot',
    'Claude-Web',
    'Claude-SearchBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'anthropic-ai',
    'cohere-ai',
    'Bytespider',
    'Amazonbot',
    'Meta-ExternalAgent',
    'OAI-SearchBot',
    'ChatGPT-User',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: friendlyAI, allow: '/' },
    ],
  }
}
