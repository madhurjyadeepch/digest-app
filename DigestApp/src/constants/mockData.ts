import { Colors } from '../constants/theme';
import { Article, Category, ChatMessage } from '../types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Technology',
    categoryColor: 'primary',
    title: 'The Silicon Frontier: Neural Engines Evolve.',
    summary:
      'New research indicates that biological-hybrid chips are outperforming traditional silicon in pattern recognition by nearly 400%.',
    dominantColor: '#1a3a5c', // Deep blue from circuit board imagery
    fullContent: [
      {
        type: 'paragraph',
        content:
          'In an era defined by the cacophony of digital notifications and the relentless push for connectivity, a new movement is emerging among the elite of Silicon Valley. They call it "Tactile Minimalism."',
      },
      {
        type: 'paragraph',
        content:
          'The philosophy is simple yet radical: strip away the interface until only the intent remains. We\'ve spent the last decade making things more visible, more bright, and more demanding. Now, we are seeing a pivot toward technology that respects the quiet corners of the human mind.',
      },
      {
        type: 'heading',
        content: 'The End of the Infinite Scroll',
      },
      {
        type: 'paragraph',
        content:
          'Modern interface design has long been optimized for "stickiness"—a polite term for addiction. However, the premium sector is moving toward "finite" experiences. Imagine an operating system that closes itself after you\'ve achieved your primary goal.',
      },
      {
        type: 'quote',
        content:
          '"Good design is obvious. Great design is transparent. The future belongs to the invisible."',
      },
      {
        type: 'heading',
        content: 'Materiality vs. Virtualization',
      },
      {
        type: 'paragraph',
        content:
          'The tactile feedback of a physical dial, the weight of a stone-encased processor, the cold touch of brushed aluminum—these are the sensory anchors being reintroduced to ground us in a world that is becoming increasingly ethereal.',
      },
    ],
    author: {
      name: 'Julian Voss',
      role: 'Lead Tech Editor',
      avatar: 'https://i.pravatar.cc/100?img=11',
    },
    readTime: '12 Min Read',
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    relatedArticles: [
      {
        id: 'r1',
        category: 'Sustainability',
        categoryColor: 'primary',
        title: 'The Green Algorithm: Reducing Digital Carbon.',
        imageUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      },
      {
        id: 'r2',
        category: 'Design',
        categoryColor: 'tertiary',
        title: 'Why Brutalism is Making a Digital Comeback.',
        imageUrl:
          'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400',
      },
      {
        id: 'r3',
        category: 'Culture',
        categoryColor: 'secondary',
        title: 'Curation Over AI: The Human Element.',
        imageUrl:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      },
    ],
  },
  {
    id: '2',
    category: 'Markets',
    categoryColor: 'secondary',
    title: 'The Green Pivot Gains Velocity.',
    summary:
      'Renewable energy investments have officially surpassed fossil fuel capital for the third consecutive quarter, signaling a permanent market shift.',
    dominantColor: '#2d5a27', // Deep green from renewable energy
    fullContent: [
      {
        type: 'paragraph',
        content:
          'For the first time in modern financial history, institutional investors are treating renewable energy not as an alternative asset class but as the primary infrastructure investment vehicle.',
      },
      {
        type: 'heading',
        content: 'A Tipping Point in Capital Flows',
      },
      {
        type: 'paragraph',
        content:
          'The numbers are staggering: $1.7 trillion flowed into clean energy in 2025 alone, dwarfing the $1.1 trillion directed toward fossil fuels. This isn\'t a trend — it\'s a structural realignment of global capital.',
      },
      {
        type: 'quote',
        content:
          '"We are witnessing the greatest capital migration in human history. The smart money doesn\'t just see green — it sees green as the only viable future."',
      },
    ],
    author: {
      name: 'Priya Mehta',
      role: 'Markets Correspondent',
      avatar: 'https://i.pravatar.cc/100?img=5',
    },
    readTime: '8 Min Read',
    imageUrl:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
  },
  {
    id: '3',
    category: 'Science',
    categoryColor: 'tertiary',
    title: 'Signals from the Great Attractor.',
    summary:
      'Deep-space arrays have captured anomalous rhythmic pulses from the center of our galactic supercluster, puzzling astrophysicists worldwide.',
    dominantColor: '#1a1040', // Deep purple-blue from space
    fullContent: [
      {
        type: 'paragraph',
        content:
          'At the heart of the Laniakea Supercluster lies a gravitational anomaly so massive it\'s pulling entire galaxy clusters toward it at 600 km/s. We call it the Great Attractor, and for the first time, we\'re hearing it speak.',
      },
      {
        type: 'heading',
        content: 'Rhythmic Patterns in the Void',
      },
      {
        type: 'paragraph',
        content:
          'The signals, detected by the Square Kilometre Array, exhibit a regularity that defies natural explanation. Every 22.7 minutes, a burst of coherent radio emissions emerges from behind the Zone of Avoidance.',
      },
      {
        type: 'quote',
        content:
          '"If these pulses are artificial, we are looking at evidence of intelligence operating on a scale we can barely comprehend."',
      },
    ],
    author: {
      name: 'Dr. Kenji Nakamura',
      role: 'Science Editor',
      avatar: 'https://i.pravatar.cc/100?img=7',
    },
    readTime: '10 Min Read',
    imageUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
  },
  {
    id: '4',
    category: 'Culture',
    categoryColor: 'error',
    title: 'The Rise of Silent Social Media.',
    summary:
      'A growing movement of Gen-Z users is abandoning algorithm-driven feeds for curated, text-only platforms that prioritize depth over dopamine.',
    dominantColor: '#3a2020', // Warm dark from culture/community
    fullContent: [
      {
        type: 'paragraph',
        content:
          'They call themselves "Digital Monks." A growing cohort of young users who have voluntarily unplugged from the visual noise of Instagram and TikTok in favor of something radically different: quiet, text-based communities.',
      },
      {
        type: 'heading',
        content: 'The Anti-Algorithm Movement',
      },
      {
        type: 'paragraph',
        content:
          'Platforms like Murmur and Dwell are seeing explosive growth. No images, no videos, no likes. Just words, arranged chronologically, with no algorithmic curation whatsoever.',
      },
    ],
    author: {
      name: 'Zara Chen',
      role: 'Culture Writer',
      avatar: 'https://i.pravatar.cc/100?img=9',
    },
    readTime: '6 Min Read',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  },
  {
    id: '5',
    category: 'Finance',
    categoryColor: 'primary',
    title: 'Decentralized Identity Reshapes Banking.',
    summary:
      'Major banks are piloting blockchain-based identity systems that could eliminate passwords and reduce fraud by 90% within five years.',
    dominantColor: '#1c2833', // Dark blue-grey from fintech
    fullContent: [
      {
        type: 'paragraph',
        content:
          'The banking industry is on the cusp of its most significant transformation since online banking. Decentralized identity — where you own your credentials on a blockchain — is moving from whitepaper theory to production reality.',
      },
      {
        type: 'heading',
        content: 'Beyond Passwords',
      },
      {
        type: 'paragraph',
        content:
          'HSBC, JPMorgan, and DBS Bank have all announced pilot programs for self-sovereign identity verification. The promise: log in once, prove your identity everywhere, and never create another password.',
      },
    ],
    author: {
      name: 'Marcus Wells',
      role: 'FinTech Analyst',
      avatar: 'https://i.pravatar.cc/100?img=12',
    },
    readTime: '7 Min Read',
    imageUrl:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
  },
];

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
