# CookAIng Generator → GlowBot Generator Component Mapping

This document maps GlowBot Generator components to their CookAIng Generator equivalents.

## Overview
The CookAIng Generator mirrors the GlowBot Generator architecture exactly, but uses CookAIng content types and naming conventions.

## Client-Side Component Mapping

### Core Pages
| GlowBot Component | CookAIng Equivalent | Status | Notes |
|-------------------|-------------------|--------|-------|
| `client/src/pages/BulkContentGeneration.tsx` | `client/src/features/cookAIngGenerator/CookAIngGeneratorPage.tsx` | ⏳ Pending | Main bulk generation page |
| `client/src/pages/UnifiedContentGeneration.tsx` | `client/src/features/cookAIngGenerator/UnifiedCookAIngGenerator.tsx` | ⏳ Pending | Unified content generation interface |

### Core Components
| GlowBot Component | CookAIng Equivalent | Status | Notes |
|-------------------|-------------------|--------|-------|
| `client/src/components/UnifiedContentGenerator.tsx` | `client/src/features/cookAIngGenerator/components/UnifiedCookAIngContentGenerator.tsx` | ⏳ Pending | Main generator component |
| `client/src/components/BulkGenerationForm.tsx` | `client/src/features/cookAIngGenerator/components/CookAIngBulkGenerationForm.tsx` | ⏳ Pending | Bulk generation form |
| `client/src/components/BulkJobsList.tsx` | `client/src/features/cookAIngGenerator/components/CookAIngBulkJobsList.tsx` | ⏳ Pending | Jobs list display |
| `client/src/components/AutomatedBulkGenerator.tsx` | `client/src/features/cookAIngGenerator/components/AutomatedCookAIngBulkGenerator.tsx` | ⏳ Pending | Automated bulk generation |
| `client/src/components/AutomatedBulkJobsList.tsx` | `client/src/features/cookAIngGenerator/components/AutomatedCookAIngBulkJobsList.tsx` | ⏳ Pending | Automated jobs list |
| `client/src/components/GeneratedContentCard.tsx` | `client/src/features/cookAIngGenerator/components/GeneratedCookAIngContentCard.tsx` | ⏳ Pending | Content display card |

### Hooks and State Management
| GlowBot Pattern | CookAIng Equivalent | Status | Notes |
|-----------------|-------------------|--------|-------|
| Bulk generation queries | `client/src/features/cookAIngGenerator/hooks/useCookAIngBulkGeneration.ts` | ⏳ Pending | React Query hooks |
| Content generation mutations | `client/src/features/cookAIngGenerator/hooks/useCookAIngContentGeneration.ts` | ⏳ Pending | Mutation hooks |
| Job status polling | `client/src/features/cookAIngGenerator/hooks/useCookAIngJobStatus.ts` | ⏳ Pending | Status polling |

### Libraries and Utils
| GlowBot Pattern | CookAIng Equivalent | Status | Notes |
|-----------------|-------------------|--------|-------|
| Prompt factory architecture | `client/src/features/cookAIngGenerator/lib/promptFactory/` | ⏳ Pending | CookAIng-specific prompts |
| Template registry | `client/src/features/cookAIngGenerator/lib/templateRegistry/` | ⏳ Pending | CookAIng content templates |
| Validation schemas | `client/src/features/cookAIngGenerator/lib/validation/` | ⏳ Pending | CookAIng output validation |

## Content Type Preservation

### CookAIng Content Types (PRESERVED)
- **Recipe Content**: `RecipePayload` interface
- **Cooking Methods**: air fryer, oven baked, grilled, pan seared, slow cooker
- **Platforms**: LinkedIn, Twitter, Instagram, TikTok, YouTube Shorts
- **Content Types**: recipe, recipePost
- **Post Types**: video, short, story, post
- **Niche**: cooking

### Key Differences from GlowBot
- Content types focus on cooking/recipe content
- Uses cooking-specific terminology and methods
- Maintains existing CookAIng schema structures
- Different niche specialization (cooking vs beauty/skincare)

## Navigation Integration
| GlowBot Pattern | CookAIng Equivalent | Status | Notes |
|-----------------|-------------------|--------|-------|
| Sidebar navigation entry | CookAIng → Generator | ⏳ Pending | Left navigation |
| Route registration | `/cookaing/generator` | ⏳ Pending | Routing setup |
| Feature flag | `features.cookAIngGenerator=true` | ⏳ Pending | Feature toggling |

## Source Toggle Implementation
| Feature | Implementation | Status | Notes |
|---------|---------------|--------|-------|
| Source toggle state | Same state shape as GlowBot | ⏳ Pending | Trending vs Platform-only |
| Persistence key | `cookAIng:sourceToggle` | ⏳ Pending | Local storage |
| Data sources | CookAIng-specific trending data | ⏳ Pending | Not GlowBot's sources |

## Test Coverage Mapping
| GlowBot Test Pattern | CookAIng Equivalent | Status | Notes |
|---------------------|-------------------|--------|-------|
| Unit tests | `client/src/features/cookAIngGenerator/tests/unit/` | ⏳ Pending | Component unit tests |
| Integration tests | `client/src/features/cookAIngGenerator/tests/integration/` | ⏳ Pending | API integration |
| E2E tests | `tests/e2e/cookAIngGenerator.spec.ts` | ⏳ Pending | Playwright tests |

## Status Legend
- ✅ Completed
- ⏳ Pending
- 🚧 In Progress
- ❌ Blocked