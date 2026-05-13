const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Strip chain-of-thought / thinking artifacts from model output.
 * Some free models (Nemotron, Trinity Thinking) expose their reasoning.
 * We only want the final, user-facing answer.
 */
function cleanThinkingOutput(text) {
  if (!text) return text;

  let cleaned = text;

  // Remove <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // Remove content before "Okay, here's..." or similar final-answer markers
  const finalMarkers = [
    /(?:^|\n)(?:Here(?:'s| is) (?:the |a |my )?(?:summary|answer|response|breakdown))/i,
    /(?:^|\n)(?:So,? (?:here(?:'s| is)|basically|in short))/i,
    /(?:^|\n)(?:To summarize)/i,
  ];

  for (const marker of finalMarkers) {
    const match = cleaned.match(marker);
    if (match && match.index !== undefined && match.index > cleaned.length * 0.3) {
      // Only trim if the thinking portion is >30% of the text
      cleaned = cleaned.substring(match.index).trim();
      break;
    }
  }

  // If the text starts with internal reasoning (common patterns)
  const thinkingPatterns = [
    /^Okay,? (?:the user|let me|I need to|so (?:the|I)|first)/i,
    /^(?:Let me|I need to|First,? I|Alright,? )/i,
    /^(?:Hmm|Okay so|Right,? )/i,
  ];

  for (const pattern of thinkingPatterns) {
    if (pattern.test(cleaned)) {
      // Find the first double newline after thinking — that's likely the actual response
      const splitIndex = cleaned.indexOf('\n\n');
      if (splitIndex > 50 && splitIndex < cleaned.length * 0.7) {
        // Check if the content after the split looks like an actual response
        const afterSplit = cleaned.substring(splitIndex).trim();
        // Only trim if the remaining part is still substantial
        if (afterSplit.length > 100) {
          cleaned = afterSplit;
          break;
        }
      }
    }
  }

  return cleaned.trim();
}

/**
 * POST /api/chat
 * Send a question about an article to the AI.
 *
 * Body:
 *   question       - The user's question (required)
 *   articleTitle    - Title of the article in context
 *   articleContent  - Full article text
 *   articleCategory - Category of the article
 *   chatHistory     - Array of { role, content } for conversation context
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      question,
      articleTitle = '',
      articleContent = '',
      articleCategory = '',
      chatHistory = [],
    } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'AI service not configured',
      });
    }

    // Build the system prompt — strict relevance + Gen Z friendly
    const systemPrompt = `You are "Digest AI", an intelligent news assistant inside the Digest news app. You help Gen Z readers understand news articles deeply.

CURRENT ARTICLE CONTEXT:
Title: ${articleTitle}
Category: ${articleCategory}
Content: ${articleContent.substring(0, 3000)}

YOUR RULES:
1. ONLY answer questions that are relevant to this article, its topic, its category, or closely related subjects.
2. If the user asks something completely unrelated (like recipes, coding help, personal advice, etc.), respond EXACTLY with: "[OFF_TOPIC] I can only help with questions about this article and its topic. Try asking about the key points, implications, or background of this story!"
3. Keep responses concise — aim for 2-4 short paragraphs max. Gen Z doesn't read walls of text.
4. Use **bold** for key terms and important phrases.
5. Be conversational, smart, and slightly witty — like a knowledgeable friend explaining the news.
6. When relevant, mention different perspectives or what this means for India/the world.
7. Don't use emojis excessively. One or two max per response.
8. Never make up facts. If you don't know something, say so.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add chat history (last 6 messages for context window efficiency)
    const recentHistory = chatHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current question
    messages.push({ role: 'user', content: question.trim() });

    // Models to try in order (free tier models on OpenRouter)
    const MODELS = [
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'arcee-ai/trinity-large-thinking:free',
      'meta-llama/llama-4-maverick',
    ];

    let response = null;
    let lastError = null;

    for (const model of MODELS) {
      try {
        response = await axios.post(
          OPENROUTER_URL,
          {
            model,
            messages,
            max_tokens: 600,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://digest-app.com',
              'X-Title': 'Digest News App',
            },
            timeout: 30000,
          }
        );

        // Check if response has actual content
        const content = response.data?.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          console.log(`[Chat] Using model: ${model}`);
          break;
        }
        // If empty content, try next model
        response = null;
      } catch (err) {
        lastError = err;
        console.warn(`[Chat] Model ${model} failed, trying next...`);
        continue;
      }
    }

    if (!response) {
      throw lastError || new Error('All AI models unavailable');
    }

    let rawAnswer =
      response.data?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    // Clean up chain-of-thought / thinking artifacts from some models
    rawAnswer = cleanThinkingOutput(rawAnswer);

    // Check if the AI flagged it as off-topic
    const isRelevant = !rawAnswer.includes('[OFF_TOPIC]');
    const cleanAnswer = rawAnswer
      .replace(/\[OFF_TOPIC\]\s*/g, '')
      .trim();

    console.log(
      `[Chat] Q: "${question.substring(0, 50)}..." → ${isRelevant ? '✅ Relevant' : '❌ Off-topic'} (${cleanAnswer.length} chars)`
    );

    res.json({
      success: true,
      data: {
        answer: cleanAnswer,
        isRelevant,
      },
    });
  } catch (error) {
    if (error.response) {
      console.error(
        '[Chat] OpenRouter error:',
        error.response.status,
        error.response.data
      );

      if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'AI is busy right now. Please try again in a moment.',
        });
      }
    } else {
      console.error('[Chat] Error:', error.message);
    }
    next(error);
  }
});

module.exports = router;
