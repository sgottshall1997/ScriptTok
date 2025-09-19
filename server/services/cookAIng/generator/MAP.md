# CookAIng Generator → GlowBot Generator Server Component Mapping

This document maps GlowBot Generator server components to their CookAIng Generator equivalents.

## Overview
The CookAIng Generator server architecture mirrors the GlowBot Generator exactly, with CookAIng-specific content types and processing.

## Server-Side Component Mapping

### Core API Routes
| GlowBot Pattern | CookAIng Equivalent | Status | Notes |
|-----------------|-------------------|--------|-------|
| `/api/bulk/` routes | `/api/cookAIng/generator/bulk/` | ⏳ Pending | Bulk generation APIs |
| `/api/generate-unified` | `/api/cookAIng/generator/generate` | ⏳ Pending | Unified generation |
| `/api/bulk/jobs` | `/api/cookAIng/generator/jobs` | ⏳ Pending | Job management |

### Service Layer
| GlowBot Component | CookAIng Equivalent | Status | Notes |
|-------------------|-------------------|--------|-------|
| Prompt factory service | `server/services/cookAIng/generator/promptFactory.ts` | ⏳ Pending | CookAIng prompt generation |
| Template registry service | `server/services/cookAIng/generator/templateRegistry.ts` | ⏳ Pending | CookAIng templates |
| Generation orchestrator | `server/services/cookAIng/generator/generate.ts` | ⏳ Pending | Main generation logic |
| Validation service | `server/services/cookAIng/generator/validate.ts` | ⏳ Pending | Output validation |
| Cache service | `server/services/cookAIng/generator/cache.ts` | ⏳ Pending | LRU/Redis caching |
| Telemetry service | `server/services/cookAIng/generator/telemetry.ts` | ⏳ Pending | Logging and metrics |
| Webhook service | `server/services/cookAIng/generator/webhook.ts` | ⏳ Pending | Make.com integration |

### Existing CookAIng Services (TO INTEGRATE)
| Existing Service | Integration Point | Status | Notes |
|------------------|------------------|--------|-------|
| `server/services/cookingContentPipeline.ts` | Prompt factory | ⏳ Pending | Recipe generation logic |
| CookAIng content types | Template registry | ⏳ Pending | Existing RecipePayload |
| Cooking methods | Content generation | ⏳ Pending | air fryer, oven baked, etc. |

## Route Structure

### Main Generator Routes
```
/api/cookAIng/generator/
├── POST /generate                 # Single content generation
├── POST /bulk/start              # Start bulk generation job
├── GET /bulk/jobs                # List bulk jobs
├── GET /bulk/jobs/:id            # Get specific job
├── POST /bulk/jobs/:id/cancel    # Cancel job
├── GET /templates                # List available templates
├── GET /cache/stats              # Cache statistics
├── POST /webhook/make            # Make.com webhook delivery
└── GET /health                   # Service health check
```

### Content Type Mapping

#### CookAIng Content Types (PRESERVED)
```typescript
interface RecipePayload {
  niche: string;                  // 'cooking'
  productName: string;            // Ingredient/dish name
  contentType: string;            // 'recipe', 'recipePost'
  script: string;                 // Recipe instructions
  captionAndHashtags: string;     // Social media caption
  platforms: string[];            // ['LinkedIn', 'Twitter', 'Instagram', 'TikTok', 'YouTube Shorts']
  videoDuration: string;          // Platform-specific duration
  imagePrompt: string;            // Food photography prompt
  cookingMethod: string;          // 'air fryer', 'oven baked', 'grilled', 'pan seared', 'slow cooker'
  postType: string;               // 'video', 'short', 'story', 'post'
  platform: string;               // Specific platform
}
```

#### Template Registry Structure
```typescript
interface CookAIngTemplate {
  id: string;                     // 'recipe-basic', 'recipe-advanced', etc.
  title: string;                  // Display name
  fields: TemplateField[];        // Form fields
  promptSpec: PromptSpecification;// AI prompt configuration
  postProcess: (content: any) => RecipePayload[]; // Output processing
  validateOutputSchema: JSONSchema; // Validation schema
  exportFormats: ExportFormat[];  // Output formats
}
```

## Cache Key Structure

### GlowBot Pattern → CookAIng Pattern
| GlowBot Cache Key | CookAIng Equivalent | TTL | Notes |
|-------------------|-------------------|-----|-------|
| `generator:bulk:*` | `cookAIng:generator:bulk:*` | 1h | Bulk job cache |
| `generator:templates:*` | `cookAIng:generator:templates:*` | 24h | Template cache |
| `generator:content:*` | `cookAIng:generator:content:*` | 30m | Generated content |
| `generator:trending:*` | `cookAIng:generator:trending:*` | 1h | Trending ingredients |

## Telemetry and Logging

### Event Names (Prefixed with cookAIng:)
| GlowBot Event | CookAIng Equivalent | Metadata |
|---------------|-------------------|----------|
| `generator.bulk.started` | `cookAIng.generator.bulk.started` | jobId, templates, count |
| `generator.bulk.completed` | `cookAIng.generator.bulk.completed` | jobId, duration, results |
| `generator.content.generated` | `cookAIng.generator.content.generated` | contentType, platform, duration |
| `generator.error.occurred` | `cookAIng.generator.error.occurred` | error, context, severity |

### Metrics Collection
| Metric | Description | Unit | Tags |
|--------|-------------|------|------|
| `cookAIng_generator_requests_total` | Total generation requests | count | method, platform |
| `cookAIng_generator_duration_ms` | Generation duration | ms | contentType, success |
| `cookAIng_generator_cache_hits` | Cache hit rate | count | cacheType |
| `cookAIng_generator_errors_total` | Error count | count | errorType, severity |

## Make.com Webhook Integration

### Webhook Payload Structure
```typescript
interface CookAIngWebhookPayload {
  app: "cookAIng";                    // App identifier
  eventType: "content.generated";     // Event type
  timestamp: string;                  // ISO timestamp
  data: {
    jobId: string;                    // Generation job ID
    contentType: string;              // Recipe type
    platform: string;                // Target platform
    content: RecipePayload;           // Generated recipe
    metadata: {
      cookingMethod: string;          // Cooking method used
      ingredient: string;             // Primary ingredient
      difficulty: string;             // Recipe difficulty
      duration: string;               // Cook time
    };
  };
}
```

### Webhook Routes
| Route | Description | Status |
|-------|-------------|--------|
| `POST /api/cookAIng/generator/webhook/make` | Make.com webhook delivery | ⏳ Pending |
| `GET /api/cookAIng/generator/webhook/health` | Webhook health check | ⏳ Pending |

## Integration Points

### Existing CookAIng Services
1. **CookingContentPipeline**: Integrate recipe generation logic
2. **Content Types**: Preserve existing RecipePayload structure
3. **Cooking Methods**: Use existing cooking method definitions
4. **Platforms**: Maintain platform-specific content generation

### Database Schema Updates
- Add cookAIng-specific bulk job tables
- Preserve existing content generation tables
- Add cookAIng generator metrics tables

## Security and Validation

### Input Validation
- Validate cooking methods against allowed list
- Validate platforms against supported platforms
- Sanitize ingredient/recipe inputs
- Rate limiting per user/IP

### Output Validation
- JSON schema validation for RecipePayload
- Content safety checks
- Platform-specific length limits
- HTML/script injection prevention

## Status Legend
- ✅ Completed
- ⏳ Pending
- 🚧 In Progress
- ❌ Blocked