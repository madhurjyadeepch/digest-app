export interface Article {
  id: string;
  category: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary' | 'error';
  title: string;
  summary: string;
  fullContent?: ArticleSection[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  dominantColor: string;
  readTime: string;
  imageUrl: string;
  relatedArticles?: RelatedArticle[];
  sourceUrl?: string;
  publishedAt?: string;
  source?: string;
  // World News API enrichments
  sentiment?: number;        // -1 to 1 sentiment score
  sourceCountry?: string;    // Country code (e.g., "in", "us")
  authors?: string[];        // Array of author names
  videoUrl?: string;         // Video URL if available
}

export interface ArticleSection {
  type: 'paragraph' | 'heading' | 'quote' | 'image';
  content: string;
  caption?: string;
}

export interface RelatedArticle {
  id: string;
  category: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary' | 'error';
  title: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  highlights?: ChatHighlight[];
  infoCards?: InfoCard[];
  warning?: WarningInfo;
  quote?: string;
}

export interface ChatHighlight {
  text: string;
  color: string;
  bold?: boolean;
}

export interface InfoCard {
  icon: string;
  title: string;
  titleColor: string;
  borderColor: string;
  content: string;
}

export interface WarningInfo {
  icon: string;
  content: string;
}
