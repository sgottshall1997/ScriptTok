# 🧪 Comprehensive Unified Content Generator Test & Debug Prompt

## Executive Summary
This prompt will run comprehensive tests to validate and fix the unified content generator across all model/format combinations. It addresses recent issues with wrong products, 500 errors, empty scripts, and inconsistent behavior.

## Quick Start Command
```bash
# Run the complete test suite
curl -X POST http://localhost:5000/api/test/test-unified-generator -H "Content-Type: application/json" | jq
```

## What This Test Suite Does

### 🎯 **Primary Issues Being Tested**
1. **Product Association** - Ensures selected product is correctly used in generation
2. **Script Validation** - Blocks empty/invalid scripts from completion
3. **Claude + Spartan Mode** - Validates proper AI model and format application
4. **Error Handling** - Catches 500 errors with informative feedback
5. **All Format Combinations** - Tests every valid model × format pair

### 🔍 **Test Scenarios Covered**
The test suite runs **8 comprehensive test cases**:

1. **Claude + Spartan Format** (Product Review)
2. **Claude + Spartan Format** (Short Video Script)  
3. **Claude + Default Format** (Unboxing Experience)
4. **Claude + Default Format** (Expert Review)
5. **ChatGPT + Spartan Format** (Short Video Script)
6. **ChatGPT + Spartan Format** (Product Comparison)
7. **ChatGPT + Default Format** (Viral Hook Generator)
8. **ChatGPT + Default Format** (Problem-Solution)

### 📊 **What Gets Validated For Each Test**
- ✅ **Content Quality**: Script is not empty, has minimum length, references product
- ✅ **Model Accuracy**: Correct AI model (Claude/ChatGPT) actually used 
- ✅ **Format Compliance**: Spartan format rules (no banned words, emojis, etc.)
- ✅ **Platform Generation**: All platform captions generated successfully
- ✅ **Error Resilience**: Graceful handling of failures with retry logic
- ✅ **Execution Performance**: Response times and generation efficiency

## Step-by-Step Testing Process

### Phase 1: Run Complete Test Suite
```bash
# Test all 8 model/format combinations
curl -X POST http://localhost:5000/api/test/test-unified-generator \
  -H "Content-Type: application/json" \
  | jq '.summary' -r
```

**Expected Output:**
- Markdown report with pass/fail status for each test
- Detailed error analysis and recommendations
- Performance metrics and execution times

### Phase 2: Test Specific Failing Combinations
If any tests fail, run individual tests:

```bash
# Test Claude + Spartan specifically
curl -X POST http://localhost:5000/api/test/test-single-config \
  -H "Content-Type: application/json" \
  -d '{
    "aiModel": "claude",
    "useSpartanFormat": true,
    "productName": "Sony WH-1000XM5 Wireless Headphones",
    "niche": "tech"
  }' | jq
```

### Phase 3: Manual Verification
Test the actual UI workflow:

1. **Navigate to Unified Generator**: `/unified-generator`
2. **Test Single Product Tab**:
   - Product: "Adjustable Dumbbells 55lb Pair"
   - Niche: "Fitness" 
   - AI Model: "Claude"
   - Enable "Use Spartan Format"
   - Generate content
3. **Verify Results**:
   - Script is not empty
   - Product name appears in content
   - No 500 errors
   - Platform captions generated

## Debugging Commands

### Check Server Logs During Generation
```bash
# Monitor logs in real-time
tail -f /tmp/server.log | grep -E "(🔄|❌|✅|⚠️)"
```

### Test Individual Components
```bash
# Test Spartan content generation directly
curl -X POST http://localhost:5000/api/spartan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sony WH-1000XM5",
    "niche": "tech",
    "contentType": "spartanVideoScript",
    "aiModel": "claude"
  }' | jq
```

### Database Content Verification
```bash
# Check if content is properly saved
curl http://localhost:5000/api/history | jq '.history[-1]'
```

## Success Criteria

### ✅ **All Tests Pass**: 8/8 tests successful
- No empty scripts generated
- Correct AI models used (Claude vs ChatGPT)
- Proper format application (Spartan vs Default)
- Platform captions generated for all platforms
- Content saved to database with correct metadata

### ✅ **Error Handling Works**: Graceful failure management
- 500 errors are caught and logged with details
- Retry logic attempts alternative approaches
- User receives informative error messages
- System continues operating after failures

### ✅ **Performance Acceptable**: Generation times under 30 seconds
- Individual tests complete in under 15 seconds
- Full test suite completes in under 2 minutes
- Memory usage remains stable during testing

## Common Issues & Fixes

### 🐛 **Issue: Empty Scripts Generated**
**Detection:** Test validation catches scripts with length < 10
**Fix:** Enhanced retry logic with alternative generation methods
**Verification:** `validateGeneratedContent()` function blocks empty content

### 🐛 **Issue: Wrong AI Model Used**
**Detection:** Model field doesn't match requested aiModel parameter
**Fix:** Explicit model parameter passing through generation chain
**Verification:** Response includes both display name and technical model used

### 🐛 **Issue: Spartan Format Not Applied**
**Detection:** Spartan content contains banned words or emojis
**Fix:** Dedicated Spartan validation and format enforcement
**Verification:** Format-specific validation rules check compliance

### 🐛 **Issue: Product Association Lost**
**Detection:** Generated content doesn't reference specified product
**Fix:** Enhanced product name validation in content
**Verification:** Script analysis checks for product keyword inclusion

## Expected Test Results Summary

After running the complete test suite, you should see:

```markdown
# 🧪 Unified Content Generator Test Results

## Executive Summary
- **Total Tests**: 8
- **Passed**: 8 ✅  
- **Failed**: 0 ❌
- **Success Rate**: 100%

## Test Results by Configuration
### Test 1: CLAUDE + Spartan Format ✅ PASSED
- **Product**: Sony WH-1000XM5 Wireless Headphones
- **Script Length**: 542 characters
- **Execution Time**: 3,241ms
- **Script Preview**: "Sony WH-1000XM5 headphones deliver professional audio quality..."

[... detailed results for all 8 tests ...]

## Issues Analysis
No significant patterns detected in failures.

## Recommendations
✅ **All Systems Operational**: No critical issues detected in unified generator
```

## Emergency Fallbacks

If tests continue failing:

1. **Check API Keys**: Ensure OPENAI_API_KEY and ANTHROPIC_API_KEY are valid
2. **Database Status**: Verify PostgreSQL connection and schema integrity  
3. **Model Availability**: Test individual AI model endpoints
4. **Memory Issues**: Restart the application if generation hangs

## Final Validation Checklist

- [ ] All 8 test configurations pass validation
- [ ] No 500 errors during generation process
- [ ] Scripts are never empty or contain only whitespace
- [ ] Correct AI models are used (Claude vs ChatGPT)
- [ ] Spartan format properly applied when selected
- [ ] Platform captions generated for all selected platforms
- [ ] Content saved to database with correct metadata
- [ ] Webhook integration works with enhanced payloads
- [ ] UI workflow from dashboard → generator → content works seamlessly

## Support Information

**Test Suite Location**: `server/tests/unified-generator-comprehensive-test.ts`
**API Endpoints**: 
- `/api/test/test-unified-generator` (Full suite)
- `/api/test/test-single-config` (Individual test)

**Documentation**: This test framework provides comprehensive validation ensuring the unified content generator operates reliably across all supported model and format combinations.