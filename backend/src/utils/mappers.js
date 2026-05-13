const crypto = require('crypto');

// ─── Category Color Mapping ─────────────────────────
// Maps API category names to the Digest app's color scheme keys
const CATEGORY_COLOR_MAP = {
  // Direct matches
  technology: 'primary',
  tech: 'primary',
  science: 'tertiary',
  business: 'secondary',
  finance: 'secondary',
  markets: 'secondary',
  health: 'error',
  entertainment: 'primary',
  sports: 'secondary',
  world: 'tertiary',
  general: 'primary',
  nation: 'secondary',
  politics: 'error',
  lifestyle: 'tertiary',
  culture: 'primary',
  environment: 'secondary',
  energy: 'tertiary',
  education: 'primary',
  food: 'tertiary',
  travel: 'secondary',
  automotive: 'primary',
  programming: 'primary',
  curiosities: 'tertiary',
  gaming: 'primary',
  design: 'tertiary',
};

/**
 * Get a consistent color key for a category name.
 */
function assignCategoryColor(category) {
  if (!category) return 'primary';
  const normalized = category.toLowerCase().trim();
  return CATEGORY_COLOR_MAP[normalized] || 'primary';
}

/**
 * Generate a deterministic article ID from its URL.
 */
function generateArticleId(url) {
  if (!url) return crypto.randomUUID();
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
}

/**
 * Estimate reading time from text content.
 * Average reading speed: ~200 words per minute.
 */
function estimateReadTime(text) {
  if (!text) return '3 Min Read';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} Min Read`;
}

/**
 * Extract a dominant color hint from the category (for gradient overlays).
 */
function getDominantColor(category) {
  const colorHints = {
    technology: '#1a3a5c',
    tech: '#1a3a5c',
    science: '#1a1040',
    business: '#1c2833',
    finance: '#1c2833',
    markets: '#2d5a27',
    health: '#3a2020',
    entertainment: '#2a1a3a',
    sports: '#1a3a2d',
    world: '#1c2833',
    general: '#1a2a3a',
    nation: '#2a1a1a',
    politics: '#2a1a1a',
    lifestyle: '#2a2a1a',
    culture: '#3a2020',
    environment: '#1a3a2d',
    energy: '#2d5a27',
    programming: '#1a1040',
    gaming: '#1a1040',
    design: '#2a1a3a',
  };
  const normalized = (category || '').toLowerCase().trim();
  return colorHints[normalized] || '#1a2a3a';
}

// ─── GNews → Digest Article Mapper ──────────────────
/**
 * Transform a GNews API article into the Digest app's Article format.
 *
 * GNews shape:
 * { title, description, content, url, image, publishedAt, source: { name, url } }
 */
function mapGNewsToArticle(gnewsArticle, index = 0) {
  const {
    title = 'Untitled',
    description = '',
    content = '',
    url = '',
    image = '',
    publishedAt = '',
    source = {},
  } = gnewsArticle;

  // GNews content field has a truncation marker "[xxxx chars]" — clean it
  const cleanContent = (content || description || '')
    .replace(/\[\d+ chars\]$/, '')
    .trim();

  // Build fullContent sections
  const fullContent = buildFullContent(cleanContent, description);

  return {
    id: generateArticleId(url),
    category: guessCategory(title, description) || 'General',
    categoryColor: assignCategoryColor(
      guessCategory(title, description) || 'general'
    ),
    title: title.trim(),
    summary: (description || cleanContent.substring(0, 200)).trim(),
    dominantColor: getDominantColor(
      guessCategory(title, description) || 'general'
    ),
    fullContent,
    author: {
      name: source.name || 'Unknown Source',
      role: 'Correspondent',
      avatar: `https://i.pravatar.cc/100?img=${(index % 70) + 1}`,
    },
    readTime: estimateReadTime(cleanContent || description),
    imageUrl: image || `https://picsum.photos/seed/${generateArticleId(url)}/800/600`,
    sourceUrl: url,
    publishedAt: publishedAt,
    source: source.name || 'Unknown',
  };
}

// ─── Currents API → Digest Article Mapper ───────────
/**
 * Transform a Currents API article into the Digest app's Article format.
 *
 * Currents shape:
 * { id, title, description, url, author, image, language, category, published }
 */
function mapCurrentsToArticle(currentsArticle, index = 0) {
  const {
    id: currentsId = '',
    title = 'Untitled',
    description = '',
    url = '',
    author: authorName = '',
    image = '',
    category = [],
    published = '',
  } = currentsArticle;

  const categoryName =
    Array.isArray(category) && category.length > 0 ? category[0] : 'General';

  const fullContent = buildFullContent(description, '');

  return {
    id: currentsId || generateArticleId(url),
    category: capitalize(categoryName),
    categoryColor: assignCategoryColor(categoryName),
    title: title.trim(),
    summary: (description || '').substring(0, 250).trim(),
    dominantColor: getDominantColor(categoryName),
    fullContent,
    author: {
      name: authorName || 'Staff Reporter',
      role: 'Contributor',
      avatar: `https://i.pravatar.cc/100?img=${(index % 70) + 1}`,
    },
    readTime: estimateReadTime(description),
    imageUrl:
      image && image !== 'None'
        ? image
        : `https://picsum.photos/seed/${generateArticleId(url)}/800/600`,
    sourceUrl: url,
    publishedAt: published,
    source: authorName || 'Currents',
  };
}

// ─── Helpers ─────────────────────────────────────────

/**
 * Build fullContent sections array from raw text.
 */
function buildFullContent(mainText, description) {
  const sections = [];

  if (description && description !== mainText) {
    sections.push({ type: 'paragraph', content: description });
  }

  if (mainText) {
    // Split by double newlines or periods followed by newlines for paragraphs
    const paragraphs = mainText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    paragraphs.forEach((para, i) => {
      // If a paragraph looks like a heading (short, no period at end)
      if (para.length < 80 && !para.endsWith('.') && i > 0) {
        sections.push({ type: 'heading', content: para });
      } else {
        sections.push({ type: 'paragraph', content: para });
      }
    });
  }

  // Ensure we have at least one section
  if (sections.length === 0) {
    sections.push({
      type: 'paragraph',
      content: description || mainText || 'Full article content not available.',
    });
  }

  return sections;
}

/**
 * Simple category guesser from title/description keywords.
 * Used for GNews which doesn't always return a category field.
 */
function guessCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  const patterns = [
    { keywords: ['ai ', 'artificial intelligence', 'machine learning', 'robot', 'tech', 'software', 'app ', 'silicon', 'chip', 'nvidia', 'google', 'apple', 'microsoft', 'startup', 'cyber', 'data', 'algorithm', 'quantum', 'cloud', 'computer'], category: 'Technology' },
    { keywords: ['stock', 'market', 'invest', 'economy', 'gdp', 'inflation', 'fed ', 'federal reserve', 'bank', 'crypto', 'bitcoin', 'trade', 'wall street', 'dow', 'nasdaq', 'financial'], category: 'Finance' },
    { keywords: ['climate', 'environment', 'carbon', 'renewable', 'solar', 'wind energy', 'emission', 'green', 'sustainability', 'pollution', 'ocean', 'forest'], category: 'Environment' },
    { keywords: ['health', 'medical', 'hospital', 'disease', 'vaccine', 'drug', 'cancer', 'mental health', 'wellness', 'fda', 'doctor', 'treatment', 'clinical'], category: 'Health' },
    { keywords: ['space', 'nasa', 'planet', 'star', 'galaxy', 'rocket', 'physics', 'biology', 'research', 'study finds', 'scientists', 'discovery', 'experiment', 'mars', 'moon'], category: 'Science' },
    { keywords: ['sport', 'nba', 'nfl', 'soccer', 'football', 'tennis', 'cricket', 'olympic', 'champion', 'league', 'tournament', 'player', 'coach', 'game'], category: 'Sports' },
    { keywords: ['movie', 'film', 'music', 'concert', 'celebrity', 'netflix', 'hollywood', 'actor', 'actress', 'entertainment', 'show', 'series', 'album', 'award', 'oscar'], category: 'Entertainment' },
    { keywords: ['election', 'president', 'congress', 'senate', 'vote', 'democrat', 'republican', 'government', 'policy', 'law', 'supreme court', 'legislation'], category: 'Politics' },
    { keywords: ['war', 'conflict', 'military', 'troops', 'nato', 'un ', 'united nations', 'diplomacy', 'foreign', 'international', 'country', 'nation'], category: 'World' },
  ];

  for (const { keywords, category } of patterns) {
    for (const kw of keywords) {
      if (text.includes(kw)) return category;
    }
  }

  return null;
}

/**
 * Capitalize first letter of a string.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = {
  mapGNewsToArticle,
  mapCurrentsToArticle,
  generateArticleId,
  estimateReadTime,
  assignCategoryColor,
  getDominantColor,
  capitalize,
};
