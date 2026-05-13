import { Colors } from '../constants/theme';
import { Category, ChatMessage } from '../types';

// ─── Categories ─────────────────────────────────────
// These remain static — they map to API query parameters
export const CATEGORIES: Category[] = [
  {
    id: 'world',
    name: 'WORLD',
    icon: 'public',
    backgroundColor: Colors.primary,
    textColor: Colors.onPrimary,
  },
  {
    id: 'tech',
    name: 'TECH',
    icon: 'memory',
    backgroundColor: Colors.secondary,
    textColor: Colors.onSecondary,
  },
  {
    id: 'culture',
    name: 'CULTURE',
    icon: 'theater-comedy',
    backgroundColor: Colors.tertiary,
    textColor: Colors.onTertiary,
  },
  {
    id: 'science',
    name: 'SCIENCE',
    icon: 'science',
    backgroundColor: Colors.error,
    textColor: Colors.onError,
  },
  {
    id: 'finance',
    name: 'FINANCE',
    icon: 'payments',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  {
    id: 'life',
    name: 'LIFE',
    icon: 'spa',
    backgroundColor: Colors.primaryContainer,
    textColor: Colors.onPrimaryContainer,
  },
  {
    id: 'design',
    name: 'DESIGN',
    icon: 'brush',
    backgroundColor: Colors.secondaryContainer,
    textColor: Colors.onSecondaryContainer,
  },
  {
    id: 'health',
    name: 'HEALTH',
    icon: 'health-and-safety',
    backgroundColor: Colors.tertiaryContainer,
    textColor: Colors.onTertiaryContainer,
  },
];

// ─── Chat Messages ──────────────────────────────────
// AI chat messages are pre-built conversation demos (not news data)
// These will be replaced when the AI chat backend is integrated
export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg1',
    type: 'user',
    content:
      'Can you explain the significance of "feature steering" mentioned in the third paragraph? How does it actually change the AI\'s behavior?',
  },
  {
    id: 'msg2',
    type: 'ai',
    content:
      'Feature steering is the process of manually activating or suppressing specific conceptual neurons within an AI model. Think of it as a **tuning fork** for the model\'s internal worldview.',
    highlights: [
      { text: 'tuning fork', color: Colors.secondary, bold: true },
    ],
    infoCards: [
      {
        icon: 'tune',
        title: 'MECHANISM',
        titleColor: Colors.secondary,
        borderColor: Colors.secondary,
        content:
          "By adding a vector to the residual stream, we can force the model to focus on specific attributes like 'honesty' or 'creative flair'.",
      },
      {
        icon: 'flash-on',
        title: 'IMPACT',
        titleColor: Colors.tertiary,
        borderColor: Colors.tertiary,
        content:
          "It eliminates the need for complex prompting, allowing for direct control over the model's personality and safety guardrails.",
      },
    ],
    quote:
      '"In essence, we are moving from asking the model to act a certain way, to literally rewiring its thought process in real-time."',
  },
  {
    id: 'msg3',
    type: 'user',
    content:
      'Is there a risk of "catastrophic forgetting" when steering these features too aggressively?',
  },
  {
    id: 'msg4',
    type: 'ai',
    content:
      'Absolutely. Over-steering can lead to **Conceptual Collapse**.',
    highlights: [
      { text: 'Conceptual Collapse', color: Colors.error, bold: true },
    ],
    warning: {
      icon: 'warning',
      content:
        'When a single feature is amplified excessively, it dominates all other semantic signals, causing the model to lose coherence and produce repetitive or nonsensical output.',
    },
  },
];

// Color mapping helper
export const getCategoryColors = (
  colorKey: 'primary' | 'secondary' | 'tertiary' | 'error'
) => {
  const map = {
    primary: {
      bg: Colors.primary,
      text: Colors.onPrimaryContainer,
      label: Colors.onPrimaryContainer,
    },
    secondary: {
      bg: Colors.secondary,
      text: Colors.onSecondaryFixed,
      label: Colors.onSecondaryFixed,
    },
    tertiary: {
      bg: Colors.tertiary,
      text: Colors.onTertiaryFixed,
      label: Colors.onTertiaryFixed,
    },
    error: {
      bg: Colors.error,
      text: Colors.onError,
      label: Colors.onError,
    },
  };
  return map[colorKey];
};
