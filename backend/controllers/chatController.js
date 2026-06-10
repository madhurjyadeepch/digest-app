const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

/**
 * Strips <think>...</think> blocks some models expose in their output.
 */
function cleanThinkingOutput(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Calls the Groq API with the given messages and system prompt.
 */
async function fetchFromGroq(messages, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return { answer: cleanThinkingOutput(raw) };
}

// POST /api/chat
exports.chat = catchAsync(async (req, res, next) => {
  const {
    question,
    articleTitle = '',
    articleContent = '',
    articleCategory = '',
    chatHistory = [],
  } = req.body;

  if (!question) {
    return next(new AppError('question is required.', 400));
  }

  // Inject article context into the system prompt (max 3000 chars of content)
  const truncatedContent = articleContent.slice(0, 3000);

  const systemPrompt = `You are a helpful news assistant for the Digest app.
The user is currently reading an article with the following details:

Title: ${articleTitle || 'N/A'}
Category: ${articleCategory || 'N/A'}
Content:
${truncatedContent || 'N/A'}

Answer questions about this article clearly and concisely.
If the user asks something completely unrelated to this article or news in general, respond ONLY with: [OFF_TOPIC]
Do NOT include any internal reasoning, "<think>" tags, or meta-commentary in your response.`;

  // Build message history for multi-turn context
  const messages = [
    ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  const { answer } = await fetchFromGroq(messages, systemPrompt);

  const isOffTopic = answer.includes('[OFF_TOPIC]');

  res.status(200).json({
    success: true,
    data: {
      answer: isOffTopic
        ? "I can only answer questions related to the article you're reading."
        : answer,
      isRelevant: !isOffTopic,
    },
  });
});
