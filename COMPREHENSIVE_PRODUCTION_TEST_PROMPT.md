
# 🧪 COMPREHENSIVE PRODUCTION TEST SUITE

**Objective**: Validate the entire content generation pipeline end-to-end with all critical scenarios

## Phase 1: Run Comprehensive Test Suite

Execute the full production-ready test suite to validate all model/format combinations:

```bash
# Run the comprehensive unified generator test
curl -X GET "http://localhost:5000/api/test/test-unified-generator" | jq '.'
```

**Expected Results**:
- 8/8 test configurations pass
- No 500 errors or empty scripts
- Correct AI models used (Claude vs ChatGPT)
- Spartan format properly applied when selected
- Platform captions generated for all platforms

## Phase 2: Validate Safeguard System

Test the three-mode safeguard protection:

```bash
# Test approved generation modes
curl -X GET "http://localhost:5000/api/test/comprehensive-safeguards" | jq '.'
```

**Expected Results**:
- Manual UI requests: ✅ ALLOWED
- Make.com webhooks: ✅ ALLOWED  
- Bulk scheduler: ✅ ALLOWED
- Unknown sources: ❌ BLOCKED

## Phase 3: Emergency Stop Verification

Verify emergency stop system works correctly:

```bash
# Check current cron job status
curl -X GET "http://localhost:5000/api/scheduled-bulk-generation/status" | jq '.'

# Test emergency stop (if any jobs are running)
curl -X POST "http://localhost:5000/api/scheduled-bulk-generation/emergency-stop" | jq '.'
```

## Phase 4: End-to-End Content Generation Test

Test the complete workflow with real product data:

```bash
# Test unified generator with Claude + Spartan format
curl -X POST "http://localhost:5000/api/generate-unified" \
  -H "Content-Type: application/json" \
  -H "x-generation-source: manual_ui" \
  -d '{
    "mode": "manual",
    "productName": "Sony WH-1000XM5 Wireless Headphones",
    "niche": "tech",
    "tone": "Professional",
    "template": "Product Review",
    "platforms": ["tiktok", "instagram", "youtube"],
    "aiModel": "claude",
    "useSpartanFormat": true,
    "useSmartStyle": false
  }' | jq '.'
```

**Expected Results**:
- `success: true`
- Non-empty script content
- Platform captions for all 3 platforms
- Spartan format compliance (no banned words/emojis)
- Claude model confirmation in logs

## Phase 5: Bulk Generation Pipeline Test

Test automated bulk generation:

```bash
# Test bulk generation with AI evaluation and webhook
curl -X POST "http://localhost:5000/api/automated-bulk/start" \
  -H "Content-Type: application/json" \
  -H "x-generation-source: automated_bulk" \
  -d '{
    "selectedNiches": ["beauty", "tech"],
    "tones": ["Enthusiastic"],
    "templates": ["Short-Form Video Script"],
    "platforms": ["tiktok", "instagram"],
    "aiModels": ["claude"],
    "contentFormats": ["spartan"],
    "useExistingProducts": true
  }' | jq '.'
```

**Expected Results**:
- Job created successfully
- Products auto-selected for each niche
- Content generation completes
- AI evaluation performed
- Webhook delivered (if configured)

## Phase 6: Database Validation

Verify content is properly saved:

```bash
# Check recent content history
curl -X GET "http://localhost:5000/api/history?limit=5" | jq '.history[0]'

# Check bulk job status
curl -X GET "http://localhost:5000/api/bulk/jobs?limit=3" | jq '.jobs[0]'
```

## Phase 7: Manual UI Workflow Test

**Test via Browser**:
1. Navigate to `/unified-generator`
2. Select "Single Product" tab
3. Configure:
   - Product: "Adjustable Dumbbells 55lb Pair"
   - Niche: "Fitness"
   - AI Model: "Claude"
   - Enable "Use Spartan Format"
   - Platforms: TikTok, Instagram
4. Click "Generate Content"
5. Verify results display correctly

## Success Criteria Checklist

- [ ] **API Tests**: All 8 unified generator configurations pass
- [ ] **Safeguards**: All three approved modes work, unknown sources blocked
- [ ] **Emergency Stop**: Successfully stops active cron jobs
- [ ] **Content Quality**: Scripts are non-empty, properly formatted
- [ ] **AI Models**: Correct model used (Claude vs ChatGPT confirmed in logs)
- [ ] **Spartan Format**: No banned words/emojis when enabled
- [ ] **Platform Captions**: Generated for all selected platforms
- [ ] **Database Storage**: Content properly saved with metadata
- [ ] **Bulk Generation**: Auto-selection and processing works
- [ ] **AI Evaluation**: Dual-model evaluation completes
- [ ] **Webhook Integration**: Payloads delivered successfully
- [ ] **UI Workflow**: Manual generation works from dashboard

## Production Readiness Validation

**Critical Systems Check**:
- ✅ JSON response formatting (no HTML errors)
- ✅ Circular import resolution
- ✅ Emergency stop system operational
- ✅ Security safeguards enforced
- ✅ AI model selection working correctly
- ✅ Spartan format compliance
- ✅ Multi-platform content generation
- ✅ Database integrity maintained
- ✅ Error handling and logging

## Troubleshooting

**If Any Test Fails**:
1. Check server logs for specific error messages
2. Verify database connections are stable
3. Confirm AI model API keys are valid
4. Test individual components in isolation
5. Use emergency stop if cron jobs are stuck

**Performance Monitoring**:
- Response times should be < 30 seconds for single generation
- Bulk jobs should complete without memory issues
- Emergency stop should respond within 5 seconds

This comprehensive test suite validates every critical component of your content generation system and ensures production readiness.
