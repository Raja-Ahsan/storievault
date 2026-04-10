<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function send(Request $request)
    {
        $message = $request->message;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4.1-nano-2025-04-14',
            'messages' => [
                ['role' => 'user', 'content' => $message]
            ]
        ]);
        return response()->json([
            'response' => $response->json()['choices'][0]['message']['content'] ?? 'No response from AI',
        ]);
    }

    /**
     * Generate a creative story prompt from the user's selection summary using OpenAI.
     */
    public function generatePrompt(Request $request)
    {
        $request->validate([
            'selection_summary' => 'required|string|max:2000',
        ]);

        $apiKey = env('OPENAI_API_KEY');
        if (empty($apiKey)) {
            return response()->json([
                'error' => 'OpenAI API key is not configured. Add OPENAI_API_KEY to your .env file.',
            ], 500);
        }

        $selectionSummary = $request->selection_summary;

        $systemPrompt = 'You are a creative writing assistant. Generate a story opening based on the user\'s preferences (genre, sub-genre, POV, length, tone, themes, time period).

Rules:
- Use the exact POV requested (e.g. first person: "I...", third person: "She/He/They...").
- Match the genre, sub-genre, tone, themes, and time period in the content.
- LENGTH IS CRITICAL:
  * If the user chose "Single Sentence", output exactly one sentence—nothing more.
  * If the user chose "Full Page (approximately 500–700 words)", you MUST write a full story opening of between 500 and 700 words. Write multiple paragraphs (e.g. 4–8 paragraphs), develop the scene and character, and do not stop until you have reached at least 500 words. This is a full page of content, not a short teaser.
- Do NOT add any prefix, label, or quotation marks (e.g. no "Prompt:", "Story prompt:", or extra explanation). Output ONLY the story text itself. 
- Do Not Use  or En Dashes. Use Regular Hyphens.
';

        $wantsFullPage = str_contains($selectionSummary, 'Full Page (approximately 500–700 words)');
        $maxTokens = $wantsFullPage ? 1200 : 150; // ~700 words needs ~900+ tokens; 150 is enough for one sentence

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4.1-nano-2025-04-14',
            'max_tokens' => $maxTokens,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => "User's story preferences:\n\n" . $selectionSummary],
            ],
        ]);

        $body = $response->json();
        $generatedPrompt = $body['choices'][0]['message']['content'] ?? null;

        if (!$response->successful()) {
            $openAiError = $body['error']['message'] ?? $body['error'] ?? null;
            $errorMessage = is_string($openAiError)
                ? $openAiError
                : (is_array($openAiError) ? ($openAiError['message'] ?? 'Unknown API error') : 'Failed to generate prompt. Please try again.');
            return response()->json([
                'error' => $errorMessage,
            ], $response->status());
        }

        if (!$generatedPrompt) {
            return response()->json([
                'error' => $body['error']['message'] ?? 'No prompt was returned. Please try again.',
            ], 422);
        }

        // Strip common prefixes the model might add (e.g. "Prompt:", "Story prompt:")
        $text = trim($generatedPrompt);
        $prefixes = ['Prompt:', 'Story prompt:', 'Story Prompt:', 'Generated prompt:', 'Here is your prompt:'];
        foreach ($prefixes as $prefix) {
            if (stripos($text, $prefix) === 0) {
                $text = trim(substr($text, strlen($prefix)));
                break;
            }
        }

        return response()->json([
            'prompt' => $text,
        ]);
    }
}
