# Design System Document: The Kinetic Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Canvas"**

This design system is built to transform information consumption from a chore into a premium editorial experience. By moving away from the rigid, boxy constraints of traditional news aggregators, we embrace **Soft Minimalism**—a philosophy that prioritizes breathing room, tactile layering, and high-energy color accents. 

The system rejects the "template" look. Instead of a flat grid, we utilize intentional asymmetry, overlapping card stacks, and dramatic typography scales to create a sense of momentum. It is clean and modern, yet feels "vibrant but sophisticated" through a calculated balance of deep, obsidian foundations and high-contrast, neon-tinted highlights.

---

## 2. Colors & Surface Philosophy
The palette is anchored by a deep, monochromatic base to ensure that the "vibrant" accents feel intentional and prestigious rather than overwhelming.

### The Foundation
*   **Background (`#0e0e0f`):** The primary void. All content lives on or above this depth.
*   **On-Background/Surface (`#ffffff`):** Pure white for maximum legibility on dark surfaces.
*   **Primary Accent (`#ff8d87` - Coral):** Used for critical actions and brand-level highlights.
*   **Secondary Accent (`#26fedc` - Teal):** Reserved for secondary logic or specific category tagging.
*   **Tertiary Accent (`#ffdb8f` - Amber):** Used for "Live" states or cautionary editorial notes.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Separation must be achieved through:
1.  **Background Shifts:** Using `surface-container-low` vs. `surface-container-high`.
2.  **Vertical Space:** Utilizing the Spacing Scale (specifically `8` to `12` increments) to create logical groupings.
3.  **Tonal Transitions:** Defining an area by a subtle shift in black/gray depth rather than a structural line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of luxury paper. 
*   **Lowest Level:** `surface-container-lowest` (#000000) for deep background elements.
*   **Mid Level:** `surface-container` (#1a191b) for standard content blocks.
*   **Highest Level:** `surface-container-highest` (#262627) for interactive elements that need to "pop" toward the user.

### The Glass & Gradient Rule
To achieve a "high-end" feel, use **Glassmorphism** for floating navigation and modal headers. 
*   **Token:** `surface-variant` at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Use subtle linear gradients (e.g., `primary` to `primary-container`) for hero CTAs. This adds "soul" and prevents the flat, "material-default" look.

---

## 3. Typography: Plus Jakarta Sans
The typography system is the backbone of the brand’s "sophisticated" personality. We use **Plus Jakarta Sans** for its geometric clarity and modern terminal cuts.

*   **Display (lg/md/sm):** Used for breaking news or major editorial section headers. 
    *   *Strategy:* Use tight letter-spacing (-0.02em) to make headlines feel authoritative.
*   **Headline (lg/md):** Used for article titles in feeds. These must be high-contrast (On-Surface on Background).
*   **Body (lg/md):** Optimized for long-form reading. 
    *   *Constraint:* Never go below `body-md` (0.875rem) for news content to maintain premium accessibility.
*   **Label (md/sm):** Uppercase, with slight tracking (+0.05em), used for categories or metadata. This creates a "technical" contrast against the fluid headline styles.

---

## 4. Elevation & Depth
We eschew the standard "drop shadow" in favor of **Tonal Layering**.

### The Layering Principle
Depth is achieved by stacking surface tokens. A news card using `surface-container-high` placed on the `background` creates a soft, natural lift. This mimics natural light falling on varied materials.

### Ambient Shadows
When a "floating" effect is required (e.g., a "Follow" button or a floating navigation bar):
*   **Blur:** `24px` to `40px` (Extra-diffused).
*   **Opacity:** `4%` to `8%`.
*   **Color:** Use a tinted version of `surface-tint` (#ff8d87) at very low opacity rather than pure black to simulate ambient light bounce.

### The "Ghost Border" Fallback
If a container requires a boundary for accessibility (e.g., an input field), use a **Ghost Border**:
*   **Token:** `outline-variant` (#484849) at **15% opacity**. 100% opaque borders are forbidden.

---

## 5. Components

### Cards & News Stacks
*   **Style:** Forbid dividers. Use `spacing-6` (2rem) as a minimum gutter between content pieces.
*   **Interaction:** Use "Stacking" layouts (as seen in reference images) where secondary news cards peek out from behind the primary card, utilizing `surface-container` tiers to distinguish depth.
*   **Corners:** Use `Roundedness-xl` (1.5rem) for main cards to feel modern but not "bubbly."

### Buttons
*   **Primary:** Fill with `primary-fixed` (#ff7670), text in `on-primary` (#65000a). Use `full` roundedness (9999px) for a "pill" aesthetic.
*   **Secondary:** Ghost style using the "Ghost Border" rule. 
*   **Tertiary:** Text-only, using `label-md` bold, for low-priority navigation.

### Floating Navigation
*   **Concept:** Navigation should be "out of the way." 
*   **Implementation:** A centered, floating pill at the bottom of the viewport using `surface-container-highest` with a 40% backdrop-blur. Avoid top-heavy navigation bars that "clank" against the status bar.

### Inputs & Fields
*   **Base:** `surface-container-low` (#131314).
*   **State:** On focus, the ghost border opacity increases to 40% and uses the `secondary` (#26fedc) color.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use asymmetrical padding. Allow more space at the top of a card than the bottom to create "editorial weight."
*   **Do** color-code news cards using the vibrant accent tokens (Coral, Amber, Teal, Lime) to help users categorize information at a glance.
*   **Do** ensure all text on vibrant backgrounds meets a 4.5:1 contrast ratio. Use `on-primary-container` or `on-secondary-container` tokens for this.

### Don't:
*   **Don't** use Purple. It is strictly excluded from this system to maintain the specific brand personality of 'Digest'.
*   **Don't** use 1px dividers. If you feel the need for a line, add `spacing-4` (1.4rem) of white space instead.
*   **Don't** use "Standard" box shadows. If an element doesn't feel elevated enough, increase its `surface-container` tier rather than adding a shadow.
*   **Don't** crowd the edges. The minimum outer margin for any screen should be `spacing-6` (2rem).