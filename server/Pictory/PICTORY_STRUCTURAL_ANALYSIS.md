# Pictory Tool Pages - Structural Analysis for ScriptTok Implementation

## Executive Summary

This document provides a detailed structural analysis of three Pictory tool pages to extract key patterns for implementing ScriptTok tool pages. The analysis covers page architecture, visual design patterns, component specifications, and content flow strategies.

---

## 1. Page Structure & Section Breakdown

### 1.1 Hero Section
**Structure:**
- Two-column flex layout (`tcb-flex-row v-2 tcb--cols--2`)
- Left column: Content (headline, subheadline, CTA)
- Right column: Video/visual demo

**Headline Pattern:**
```html
<h1>
  <section class="rws-container">
    <p class="rw-static-line slide">
      <span>Fixed text</span>
      <span class="rw-words-wrapper waiting" style="color: #7556f0;">
        <b class="is-visible">EVERYONE!</b>
        <b>YouTubers</b>
        <b>Course Creators</b>
        <!-- Rotating text for different personas -->
      </span>
    </p>
  </section>
</h1>
```

**Subheadline:**
- Simple paragraph below headline
- Example: "Create engaging videos in minutes using the power of AI."

**Primary CTA:**
- Button with icon + text pattern
- Classes: `thrv-button thrv-button-v2 tcb-local-vars-root tcb-with-icon tcb-flip tcb-global-button-mdzvwnrj`
- Icon: Arrow forward (SVG)
- Text: "Get started for FREE" with leading space and icon
- Secondary text below: "No video editing experience required."

**Visual Demo:**
- 16:9 aspect ratio video/iframe
- Border radius: 20px
- Embedded Cloudflare Stream player with autoplay, muted, loop

### 1.2 Trust Indicators Section
**Structure:**
- Content box container (`thrv_contentbox_shortcode thrv-content-box`)
- Floating review badges (G2, Capterra, Feefo)
- Width: 110px each
- Images with links to review platforms

### 1.3 "How It Works" Section
**Structure:**
- Section header: "HOW PICTORY WORKS" (uppercase, smaller text)
- Main headline: "Start making professional videos in minutes"
- Visual timeline image showing the process
- 3-column grid for feature cards

**Feature Cards (3-column grid):**
```html
<div class="tcb-flex-row v-2 tcb--cols--3">
  <div class="tcb-flex-col">
    <div class="tcb-col">
      <!-- Screenshot/image -->
      <div class="thrv_wrapper tve_image_caption">
        <img src="feature-image.png" />
      </div>
      
      <!-- Content box -->
      <div class="thrv_contentbox_shortcode">
        <div class="tve-cb">
          <!-- Feature title with accent color -->
          <p style="color: var(--tcb-color-1) !important;">
            Transform content to video
          </p>
          
          <!-- Feature description -->
          <p>
            Convert blog posts, homepages, text and product pages 
            into captivating content with just a few clicks.
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- Repeat for 3 columns -->
</div>
```

### 1.4 Key Features Section
**Structure:**
- Two-column layout
- Left: Image/screenshot
- Right: Expandable feature accordions

**FAQ/Toggle Accordion Pattern:**
```html
<div class="tve-toggle-grid">
  <div class="thrv_toggle_item tve_faq">
    <div class="tve_faqI">
      <!-- Toggle header -->
      <div class="tve_faqB thrv_toggle_title">
        <svg class="tcb-icon" data-id="icon-plus-circle-solid">
          <!-- Plus/minus icon -->
        </svg>
        <h2 class="tve-toggle-text">Feature Title</h2>
      </div>
      
      <!-- Toggle content -->
      <div class="tve_faqC">
        <div class="thrv_toggle_content">
          <p>Feature description...</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Repeat for multiple features -->
</div>
```

### 1.5 GPT Integration / Special Feature Section
**Structure:**
- Two-column layout
- Left: Text content with eyebrow text, headline, description, CTA
- Right: Large screenshot/image

**Pattern:**
- Eyebrow: "PICTORY GPT AI VIDEO GENERATOR" (uppercase, smaller)
- Headline: "GPT AI Video Generator" (larger)
- Description paragraph
- CTA button: "Try Pictory GPT"

### 1.6 Enterprise Section
**Structure:**
- Content box with colored background (using CSS variables)
- Three-column grid for enterprise features
- Each feature has icon/number, title, description

**Feature Cards:**
```html
<div class="thrv_contentbox_shortcode">
  <div class="tve-cb">
    <p>Custom Plans</p>
    <p>Description of enterprise feature...</p>
  </div>
</div>
```

### 1.7 Testimonials/Reviews Carousel
**Structure:**
- Carousel component (`wonderplugincarousel`)
- Slides with customer quotes
- Customer name and "Verified Customer" label
- Review platform badge (Feefo)

### 1.8 Related Tools Grid
**Structure:**
- Three-column grid of tool links
- Each link styled as a button with text highlight
- Green underline animation (`--tcb-text-highlight-color: #2ABB61`)

**Link Pattern:**
```html
<a href="/tool-url" class="tcb-button-link">
  <span class="tcb-button-text tcb-highlight-added">
    <span style="--tcb-text-highlight-color: #2ABB61 !important;">
      Tool Name
    </span>
  </span>
</a>
```

### 1.9 Final CTA Section
- Footer with large CTA button
- Newsletter signup or demo request

---

## 2. Visual Design Patterns

### 2.1 Color Scheme
**Primary Colors:**
- Purple/Violet: `#7556f0` - Used for rotating text, accents
- Green highlight: `#2ABB61` - Used for text highlights, underlines
- CSS Variables used throughout:
  - `var(--tcb-color-1)` for brand color
  - `var(--tcb-skin-color-22)` for specific sections

**Background Patterns:**
- White/light backgrounds for main content
- Colored backgrounds for enterprise/special sections
- Transparent overlays for content boxes

### 2.2 Typography Hierarchy
**Font Stack:**
- Primary: "Pictory Sans" (custom font)
- Fallback: System fonts

**Size Hierarchy:**
- Hero headline: 50px, bold
- Section headlines: Large (h1/h2 sizing)
- Eyebrow text: Uppercase, smaller (15px typical)
- Body text: 15-16px
- Button text: Normal weight with spacing

**Text Styles:**
- Rotating text: Different personas in purple color
- Highlighted text: Green underline animation
- Uppercase labels for section identifiers

### 2.3 Spacing & Layout
**Container Widths:**
- Max content width: ~1080px
- Column gaps in flex grids: CSS variable `--tcb-col-el-width`

**Padding:**
- Content boxes: `tve-elem-default-pad` class
- Section spacing: Consistent vertical rhythm
- Card padding: 8px for images, more for text content

**Margins:**
- Clear divs between sections: `tcb-clear` class
- Vertical spacing between content blocks

### 2.4 Card Styling
**Image Cards:**
- Border radius: 10px for feature images
- Aspect ratio preserved: `aspect-ratio: auto width / height`
- Lazy loading implemented

**Content Boxes:**
```css
.thrv_contentbox_shortcode {
  /* Content box wrapper */
}
.tve-content-box-background {
  /* Background layer */
}
.tve-cb {
  /* Content layer */
}
```

**Shadows:**
- Minimal shadows, focus on clean borders
- Rounded corners on images and containers

### 2.5 Button Styles
**Primary Button Pattern:**
- Classes: `thrv-button thrv-button-v2 tcb-local-vars-root tcb-with-icon tcb-flip`
- Icon position: Left (using `tcb-flip` for right)
- Icon + Text structure
- Button sizes: `data-button-size="s"` or `data-button-size-d="xl"`

**Button Components:**
```html
<div class="thrv-button">
  <a href="..." class="tcb-button-link">
    <span class="tcb-button-icon">
      <svg><!-- Arrow icon --></svg>
    </span>
    <span class="tcb-button-texts">
      <span class="tcb-button-text">Button Text</span>
    </span>
  </a>
</div>
```

**Icon:**
- Arrow forward icon (SVG)
- Viewbox: "0 0 24 24"
- Path data for arrow shape

### 2.6 Icons & Graphics
**Icon Usage:**
- Plus/minus circles for FAQ toggles
- Arrow icons for CTAs
- SVG-based for scalability

**Icon Sizing:**
- Consistent sizing within components
- Inherit style from parent: `tcb-icon-inherit-style`

---

## 3. Component Specifications

### 3.1 Hero Component
**Required Elements:**
1. Rotating text animation for personas
2. Primary headline + subheadline
3. CTA button with icon
4. Secondary reassurance text
5. Video/image demo (16:9 ratio)

**Implementation Notes:**
- Use animation library for text rotation
- Lazy load video for performance
- Maintain 50/50 split on desktop, stack on mobile

### 3.2 Feature Grid Component
**Layout:**
- 3-column grid (`tcb--cols--3`)
- Image + title + description pattern
- Consistent card heights

**Card Structure:**
1. Image/screenshot (top)
2. Accent color title
3. Multi-paragraph description
4. Optional CTA per card

### 3.3 FAQ Accordion Component
**Specifications:**
```html
<div class="tve-toggle-grid">
  <div class="thrv_toggle_item tve_faq">
    <!-- Icon: plus-circle-solid -->
    <!-- Title: h2 -->
    <!-- Content: expandable div -->
  </div>
</div>
```

**States:**
- Default: Collapsed (plus icon)
- Expanded: Open (minus icon)
- First item can be `tve-default-state-expanded`

**Icon Toggle:**
- SVG icon changes on state
- Smooth transition animation

### 3.4 Two-Column Layout Component
**Pattern:**
```html
<div class="tcb-flex-row v-2 tcb-resized tcb--cols--2">
  <div class="tcb-flex-col">
    <!-- Left content -->
  </div>
  <div class="tcb-flex-col">
    <!-- Right content -->
  </div>
</div>
```

**Usage:**
- Hero section
- Feature highlights
- GPT integration showcase

**Responsive:**
- Stacks to single column on mobile
- Maintains flex structure for alignment

### 3.5 CTA Button Component
**Variants:**
1. **Primary CTA:** Large, with icon, prominent
2. **Secondary CTA:** Text link with highlight animation
3. **Tool Links:** Grid of highlighted text links

**Global Button Classes:**
- `tcb-global-button-mdzvwnrj` (global style reference)
- Button size variants: `s`, `xl`
- With/without icon: `tcb-with-icon`

### 3.6 Trust Badge Component
**Pattern:**
- Horizontal row of review platform logos
- Each logo: 110px width
- Links to review platform
- Float layout: `data-float-d="1"`

### 3.7 Carousel Component
**Specifications:**
- Library: WonderPlugin Carousel
- Responsive: Auto-adjust to screen
- Autoplay: true
- Circular: true
- Controls: Arrow navigation

---

## 4. Content Flow & Strategy

### 4.1 Section Order
1. **Hero** - Immediate value proposition with demo
2. **Trust Indicators** - Social proof (reviews)
3. **Company Logos** - Brand trust (carousel)
4. **How It Works** - Process explanation (3-step visual)
5. **Key Features** - Detailed feature breakdown (accordion)
6. **Special Feature** - Unique selling point (GPT integration)
7. **Enterprise** - B2B offering
8. **Testimonials** - Customer stories
9. **Related Tools** - Cross-linking grid
10. **Final CTA** - Conversion opportunity

### 4.2 CTA Placement Strategy
**Primary CTAs:**
- Hero section (above fold)
- After key features
- After GPT integration
- Enterprise section
- Final CTA footer

**Secondary CTAs:**
- Related tool links (cross-selling)
- "Try" buttons for specific features

**Frequency:**
- Every 2-3 sections
- Always visible above fold
- Repeat message with slight variations

### 4.3 Cross-Linking Patterns
**Related Tools Grid:**
- 3-column layout
- 20-30 related tool links
- Organized by tool type
- Text highlight animation on hover
- Green underline accent

**Link Categories:**
- Video makers (by type)
- Generators (script, subtitle, etc.)
- Editors (AI editor, caption editor)
- Platform-specific (YouTube, Facebook, etc.)

**Implementation:**
```html
<div class="tcb-flex-row tcb--cols--3">
  <div class="tcb-flex-col">
    <!-- Column 1: 10 links -->
  </div>
  <div class="tcb-flex-col">
    <!-- Column 2: 10 links -->
  </div>
  <div class="tcb-flex-col">
    <!-- Column 3: 10 links -->
  </div>
</div>
```

### 4.4 Content Progression
**Storytelling Arc:**
1. **Hook** - Rotating personas + value prop
2. **Trust** - Social proof badges
3. **Educate** - How it works (visual)
4. **Detail** - Features (accordion for depth)
5. **Differentiate** - Unique features (GPT)
6. **Expand** - Enterprise options
7. **Validate** - Customer testimonials
8. **Explore** - Related tools
9. **Convert** - Final CTA

---

## 5. Notable Differences Between Reference Files

### File 1: AI Video Generator (main tool page)
- Most comprehensive structure
- Includes all sections listed above
- Extensive related tools grid (30+ links)
- Enterprise section prominently featured
- Multiple video demos throughout

### File 2: ChatGPT Video Generator
- Focused on ChatGPT integration
- Simpler feature accordion
- Emphasis on prompt-based creation
- Fewer related tools (focused on AI tools)
- Direct link to ChatGPT custom GPT

### File 3: Script To Video
- Process-focused layout
- Script input emphasized in hero
- Step-by-step breakdown more detailed
- Templates/customization highlighted
- Use case examples more prominent

### Common Elements Across All:
1. Hero with rotating personas
2. Purple (#7556f0) and green (#2ABB61) color scheme
3. Feature accordion/toggle pattern
4. Enterprise section
5. Testimonials carousel
6. Related tools cross-linking
7. Multiple CTAs throughout
8. Trust badges (G2, Capterra, Feefo)

---

## 6. Recommended Implementation for ScriptTok

### 6.1 Core Structure to Replicate
```
1. Hero Section
   - Rotating personas (TikTok creators, Instagram influencers, etc.)
   - Value proposition
   - Demo video (ScriptTok in action)
   - Primary CTA

2. Trust Bar
   - Social proof badges
   - User count / video count stats

3. How It Works
   - 3-step visual process
   - Feature cards with screenshots

4. Key Features Accordion
   - AI Script Generation
   - Multi-Platform Support
   - Template Library
   - Viral Score Analysis
   - Trend Discovery

5. Special Features
   - Dual Studios (unique to ScriptTok)
   - AI-powered optimization

6. Use Cases / Who It's For
   - Content creators
   - Businesses
   - Social media managers

7. Testimonials
   - Creator success stories
   - Video generation metrics

8. Related Tools Grid
   - Link to other ScriptTok features
   - Cross-sell related tools

9. Final CTA
   - Free trial or sign up
```

### 6.2 Design Tokens for ScriptTok
**Colors (based on Pictory pattern):**
- Primary: Use existing ScriptTok purple/brand color
- Accent: Green (#2ABB61) for highlights
- Background: White/light with colored sections

**Typography:**
- Hero: 50px bold
- Section headers: 32-40px
- Eyebrow text: 14-16px uppercase
- Body: 15-16px

**Spacing:**
- Max width: 1080px
- Column gap: CSS variable
- Section padding: Consistent rhythm

### 6.3 Components to Build
1. **RotatingPersonaHero** - Animated text for target users
2. **FeatureGrid** - 3-column card layout
3. **FeatureAccordion** - Expandable FAQ-style
4. **TwoColumnFeature** - Image + content split
5. **RelatedToolsGrid** - Cross-linking grid
6. **TestimonialCarousel** - Customer stories
7. **CTAButton** - Icon + text button
8. **TrustBadges** - Review platform logos

### 6.4 Content Strategy
**Personas to Rotate:**
- TikTok Creators
- Instagram Influencers
- YouTube Shorts Creators
- Content Marketers
- Social Media Managers
- Small Business Owners
- Digital Agencies

**Features to Highlight:**
- AI Script Generator (primary)
- Dual Studios (unique)
- Multi-Platform Support
- Template Library
- Viral Score Prediction
- Trend Discovery
- Video Editing Tools

**CTAs to Use:**
- "Start Creating for FREE"
- "Try ScriptTok Now"
- "Generate Your First Video"
- "See How It Works"

### 6.5 Technical Implementation Notes
**Classes to Reuse:**
- `.thrv_wrapper` - Component wrapper
- `.tcb-flex-row` - Flex layout
- `.tcb--cols--3` - 3-column grid
- `.thrv_contentbox_shortcode` - Content box
- `.tve-cb` - Content block
- `.thrv-button-v2` - Button component
- `.tve_faq` - FAQ accordion

**Responsive Patterns:**
- Use `tcb-desktop-hidden` for mobile-only
- Use `tcb-tablet-hidden` for desktop-only
- Stack columns on mobile
- Reduce font sizes on smaller screens

---

## 7. Key Takeaways

### What Works Well:
1. **Visual Hierarchy** - Clear progression from hero to conversion
2. **Social Proof** - Trust indicators early and often
3. **Progressive Disclosure** - Accordion for detailed features
4. **Multiple CTAs** - Conversion opportunities throughout
5. **Cross-Linking** - SEO and user navigation benefits
6. **Responsive Design** - Mobile-first approach
7. **Performance** - Lazy loading, optimized assets

### What to Adapt for ScriptTok:
1. **Personas** - Update rotating text for ScriptTok users
2. **Features** - Highlight unique ScriptTok capabilities
3. **Demos** - Show ScriptTok interface, not Pictory
4. **Use Cases** - Social media focus vs. general video
5. **Testimonials** - Creator success stories
6. **Tools Grid** - Link to ScriptTok features/pages

### Implementation Priority:
**Phase 1 (MVP):**
- Hero with rotating personas
- Feature grid (3 columns)
- Primary CTA
- Basic responsive layout

**Phase 2 (Enhanced):**
- Feature accordion
- Two-column layouts
- Trust badges
- Related tools grid

**Phase 3 (Complete):**
- Testimonial carousel
- Enterprise section
- Advanced animations
- Performance optimizations

---

## 8. Conclusion

The Pictory tool pages follow a proven conversion-optimized structure that can be effectively adapted for ScriptTok. The key is to:

1. **Maintain the visual hierarchy** - Hero → Features → Social Proof → Conversion
2. **Use consistent design patterns** - Color scheme, typography, spacing
3. **Implement progressive disclosure** - Accordions, toggles for depth
4. **Provide multiple conversion paths** - CTAs throughout the journey
5. **Enable exploration** - Related tools grid for discovery

By replicating these structural patterns with ScriptTok-specific content, imagery, and branding, we can create tool pages that are both familiar (reducing friction) and differentiated (highlighting unique value).
