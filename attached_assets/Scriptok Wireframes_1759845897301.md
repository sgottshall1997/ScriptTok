# 🎬 ScriptTok – Unified Wireframes (Figma‑Style)

This document consolidates the core UI wireframes into a single, consistent spec for design & build: **Landing Page → Pricing Page → Viral Content Studio → Trend Dashboard (Desktop) → Trend Dashboard (Mobile)**.

---

## 🏠 Landing Page

### 🧱 Layout Overview

```
┌────────────────────────────────────────────┐
│ Header / Navbar                           │
│────────────────────────────────────────────│
│ [🎬 ScriptTok]   Features | Pricing | Login  [🚀 Get Started] │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Hero Section                               │
│────────────────────────────────────────────│
│  Headline: “Create Viral & Affiliate TikTok Content in Seconds.” │
│  Subtext: “AI-powered scripts, trend discovery, and affiliate tools built for creators.” │
│  [⚡ Start Free] [🎥 Watch Demo]             │
│  Background: gradient with animated video thumbnail │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Key Features Section                       │
│────────────────────────────────────────────│
│  🧩 Dual Studios: Viral & Affiliate         │
│  🔥 Viral Score System                     │
│  💡 Real-Time Trend Discovery               │
│  📈 AI Performance Analytics                │
│  🎯 Multi-Platform Optimization             │
│  Layout: 2-column grid with icons + short text │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Visual Demo / Screenshot Section            │
│────────────────────────────────────────────│
│  [Mockup Carousel: Viral Studio, Affiliate Studio, Score Breakdown] │
│  Caption: “From idea to viral-ready script — all in one place.” │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Pricing Teaser                            │
│────────────────────────────────────────────│
│  🆓 Free Plan → 5 daily generations, core templates │
│  💎 Pro Plan → unlimited access, trend engine, analytics │
│  [Compare Plans →]                         │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Testimonials / Social Proof                │
│────────────────────────────────────────────│
│  “I got 100k views my first day using ScriptTok!” – Creator A │
│  “My affiliate clicks doubled.” – Creator B │
│  Layout: 3 testimonial cards with profile pics │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Call-to-Action Footer                      │
│────────────────────────────────────────────│
│  Headline: “Ready to Go Viral?”            │
│  [Start Free ⚡] [Upgrade to Pro ⭐]         │
│  Footer links: Terms | Privacy | Contact    │
└────────────────────────────────────────────┘
```

**Design Notes**

- Gradient hero (blue → violet), white cards, subtle gray bands.
- Hero `text-4xl font-bold`; subtext `text-lg text-gray-600`.
- Buttons: rounded‑xl, accent blue hover.

---

## 💰 Pricing Page

### 🧱 Layout Overview

```
┌────────────────────────────────────────────┐
│ Header / Navbar                           │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Hero / Pricing Headline                   │
│  “Choose Your Plan — Go Viral Faster.”    │
│  “Start for free. Upgrade when you’re ready to scale.” │
│  [⚡ Start Free]  [⭐ Upgrade to Pro]       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Pricing Cards (3-column grid)              │
│--------------------------------------------│
│ 🆓 Free  |  💎 Pro (Most Popular)  |  🚀 Creator+ │
│ 5 gens/day | Unlimited | Teams (5 seats)   │
│ Core templates | All templates | API + Make │
│ Basic Score | Full Score + Analytics | Bulk schedule │
│ [Start] | [$29/mo or $240/yr] | [$59/mo]   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Comparison Table (optional)                │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ FAQ (Accordion)                            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Final CTA Banner                           │
│  “Join Thousands of Viral Creators.”       │
│  [⚡ Start Free] [⭐ Upgrade to Pro]         │
└────────────────────────────────────────────┘
```

**Design Notes**

- White bg, accent blue CTAs, soft shadows. Pro card larger w/ accent border + badge.

---

## 🎬 Viral Content Studio

### 🧱 Layout Overview

```
┌────────────────────────────────────────────┐
│ Header / Navbar                           │
│ [🎬 ScriptTok]   Viral Studio | Affiliate Studio   [⚙️] │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Main Container (max-w-5xl mx-auto p-6)     │
│--------------------------------------------│
│ 🧠 Trend Summary Card (optional)            │
│  🔥 Topic: “AI Side Hustles”  |  Forecast: 86/100 │
│  [Refresh Trends] [Change Topic]            │
│--------------------------------------------│
│ 📝 Prompt Input                             │
│  [Textarea: Describe what to create…]       │
│  [Template ▼]  [Tone ▼]  [Generate ⚡]       │
│--------------------------------------------│
│ 📊 Viral Score Breakdown (post‑gen)         │
│  Overall: 82 (Green)                        │
│  Hook | Engagement | Clarity | Length | Trending │
│  💡 Suggestions list                        │
│--------------------------------------------│
│ 🎥 Output Cards (grid)                      │
│  [Title] [3‑line script] [Hashtags]         │
│  [Copy] [View Score]                        │
│--------------------------------------------│
│ 📈 Bottom Toolbar                           │
│  [⬅ Back to Templates] [History] [⭐ Upgrade] │
└────────────────────────────────────────────┘
```

**Design Notes**

- BG `#f9fafb`; cards white `rounded-2xl shadow-sm`; accent `#2563eb`.
- Consistent spacing: `gap-4`, buttons `px-4 py-2 rounded‑xl`.

---

## 📊 Trend Dashboard (Desktop)

### 🧱 Layout Overview

```
┌────────────────────────────────────────────┐
│ Header / Navbar                           │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Page Header                                │
│  “Trend Forecaster”                         │
│  “Discover trending TikTok products & topics.” │
│  [🔄 Refresh Trends] [📊 Export Report]      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Sticky Filter Bar                           │
│  [Niche ▼] [Trend Stage ▼] [Search 🔍]      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Featured Trend Highlight (Top Focus)        │
│  🏆 “Glass Skin Glow”  |  [💡 Insights] [⚡ Generate] │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Trend Category Grid                         │
│  Tabs: Hot | Rising | Upcoming | Avoid      │
│  2–3 cards per row; show 5–6 max then [Load More] │
│  Card: Title → 1‑line summary → Products (w/ prices) │
│        [Generate Script] [More Info]              │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ AI‑Powered Trending Picks (Compact Grid)    │
│  3–4 per row; Name / Price / Niche; 1‑line “Why it’s hot” │
│  [Generate] [Refresh]                        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Info + Tips                                 │
│  💡 “Trends auto‑refresh daily at 5 AM ET.”  │
│  [Trend History] [Suggest a Niche]          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ CTA Footer                                   │
│  “Turn these trends into viral posts instantly.” │
│  [⚡ Go to Viral Studio]                      │
└────────────────────────────────────────────┘
```

**Simplification Strategy**

- Show fewer cards initially; collapse sub‑niches in dropdowns.
- Consistent card heights and button placement; soft category colors.

---

## 📱 Trend Dashboard (Mobile)

### 🧱 Layout Overview (Adaptation)

```
┌────────────────────────────────────────────┐
│ Compact Header                             │
│ [🎬] ScriptTok ▼   [☰ Menu]                 │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Page Header                                 │
│  “Trend Forecaster”  |  [🔄] [📊]            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Collapsible Filters                          │
│  [Niche ▼]  [Stage ▼]  [🔍 Search]           │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Featured Trend Card (Hero)                   │
│  🏆 “Glass Skin Glow”                        │
│  [💡 Insights]  [⚡ Generate] (stacked)       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Trend Grid (Single‑column)                   │
│  Tabs scroll horizontally                    │
│  Cards stack vertically with full‑width buttons │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ AI‑Powered Picks (Horizontal Carousel)      │
│  Image | Name | Price | [Generate]          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Tips + Sticky Bottom CTA                    │
│  💡 Daily auto‑refresh tip                   │
│  [⚡ Go to Viral Studio →] (full‑width)      │
└────────────────────────────────────────────┘
```

**Mobile Considerations**

- Single‑column stacks; tabs & picks use horizontal swipe.
- Large touch targets (`h-12`), sticky CTA for conversion.

---

### 🧩 Shared Components & System

- **Shadcn/UI**: Tabs, Card, Badge, Select, Accordion, Sheet, Carousel, Button, Tooltip, Progress.
- **Tailwind System**: `rounded-2xl`, `shadow-sm`, `gap-4`, `max-w-5xl mx-auto p-6`, bg `#f9fafb`, accent `#2563eb`.
- **Navigation**: Global header + per‑page CTAs to drive “Generate”.

---

**That’s the full unified spec.** Use this as the single source of truth for building and aligning the Replit Agent prompts and React components.

