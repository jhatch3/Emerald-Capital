import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
// Try multiple possible .env file locations
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
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
    throw new Error(
      'OPENROUTER_API_KEY environment variable is not set. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

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
  model: string = 'google/gemini-1.5-pro'
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
      try {
        const errorData = await response.json() as { error?: { message?: string } };
        errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
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
