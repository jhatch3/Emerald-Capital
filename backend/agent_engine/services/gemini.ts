import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
// Try to find .env file in project root (where package.json typically is)
// Check multiple possible locations
const possiblePaths = [
  // Root from __dirname (if running from backend/agent_engine/services)
  path.resolve(__dirname, '../../../.env'),
  // Root from current working directory (if running from backend/)
  path.resolve(process.cwd(), '..', '.env'),
  // Current working directory
  path.resolve(process.cwd(), '.env'),
  // Backend directory
  path.resolve(__dirname, '../../.env'),
];

let loadedPath = null;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedPath = envPath;
    console.log(`[OpenRouter] Loaded .env from: ${envPath}`);
    break;
  }
}

if (!loadedPath) {
  console.warn('[OpenRouter] No .env file found. Checked paths:', possiblePaths);
  console.warn('[OpenRouter] Current working directory:', process.cwd());
  console.warn('[OpenRouter] __dirname:', __dirname);
}

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Get OpenRouter API key from environment
 * Only uses OPENROUTER_API_KEY (no fallback)
 */
function getOpenRouterKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('[OpenRouter] OPENROUTER_API_KEY not found in environment');
    console.error('[OpenRouter] Current working directory:', process.cwd());
    console.error('[OpenRouter] Environment keys:', Object.keys(process.env).filter(k => k.includes('OPENROUTER')));
    throw new Error(
      'OPENROUTER_API_KEY environment variable is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  // Debug: Show first/last few chars of key (for verification)
  console.log(`[OpenRouter] Key loaded: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)} (length: ${apiKey.length})`);
  
  return apiKey;
}

/**
 * Mock client for compatibility with baseAgent.ts
 * (OpenRouter uses HTTP, not a client object)
 */
export function getGeminiClient(): any {
  return {
    getGenerativeModel: (config: { model: string; generationConfig: any }) => {
      return {
        generateContent: async (prompt: string) => {
          const response = await generateJSON(prompt, config.model);
          return {
            response: {
              text: () => JSON.stringify(response)
            }
          };
        }
      };
    }
  };
}

/**
 * Generate content using OpenRouter API with JSON response
 * Forces JSON output using response_format
 */
export async function generateJSON(
  prompt: string,
  model: string = 'google/gemini-2.0-flash-lite-001'
): Promise<any> {
  try {
    const apiKey = getOpenRouterKey();
    
    // Ensure prompt explicitly requests JSON format
    const jsonPrompt = prompt + '\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON.';
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/your-repo', // Optional: for OpenRouter analytics
        'X-Title': 'Quack Hedge Fund Agent', // Optional: for OpenRouter analytics
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: jsonPrompt
          }
        ],
        response_format: { type: 'json_object' }, // Force JSON response
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let errorMessage: string;
      let errorDetails: any;
      try {
        const errorData = await response.json() as { error?: { message?: string; code?: string } };
        errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        errorDetails = errorData;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Enhanced error logging
      console.error(`[OpenRouter] API Error (${response.status}):`, errorMessage);
      if (errorDetails) {
        console.error('[OpenRouter] Error details:', JSON.stringify(errorDetails, null, 2));
      }
      
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
      error?: {
        message?: string;
        code?: number;
      };
    };
    
    // Check for error in response
    if (data.error) {
      throw new Error(`OpenRouter API error: ${data.error.message || 'Unknown error'}`);
    }
    
    // OpenRouter returns content in choices[0].message.content
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenRouter response. Response structure: ' + JSON.stringify(data, null, 2));
    }
    
    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response from OpenRouter. Content: ${content.substring(0, 200)}...`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating JSON from OpenRouter:', error.message);
      throw error;
    }
    console.error('Error generating JSON from OpenRouter:', error);
    throw new Error(`Unknown error: ${String(error)}`);
  }
}
