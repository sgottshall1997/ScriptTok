# Template Categorization: Product-Focused vs Generic

Based on analysis of template content and prompts, here's how templates are categorized:

## PRODUCT-FOCUSED TEMPLATES (usesProduct: true)
These templates center around a specific input product and generate content about that product:

### Universal Templates:
- ✅ SEO Blog Post - Creates content about the specific product
- ✅ Short-Form Video Script - Product-focused video content
- ✅ Influencer Caption - Features the specific product
- ✅ Product Comparison - Compares the input product vs alternatives
- ✅ Affiliate Email - Direct product promotion

### Beauty Templates:
- ✅ Beauty Routine - Incorporates the specific product into routine
- ✅ Expert Approved - Professional endorsement of the specific product  
- ✅ Transformation Story - Before/after using the specific product
- ✅ Product Type List - Lists including the specific product
- ✅ Dupe Alert - Compares the product with cheaper alternatives

### Tech Templates:
- ✅ Unboxing Experience - Unboxing the specific product
- ✅ Setup Guide - How to set up the specific product
- ✅ Is It Worth It? - Value analysis of the specific product
- ✅ Hidden Features - Features of the specific product

### Fitness Templates:
- ✅ Supplement Stack - Stack including the specific product
- ✅ Best Supplements List - List including the specific product

### Fashion Templates:
- ✅ How to Style This - Styling the specific product
- ✅ Dupes & Lookalikes - Alternatives to the specific product
- ✅ Haul Review - Review including the specific product

### Food Templates:
- ✅ Recipe Featuring Product - Recipe using the specific product
- ✅ Why I Switched - Why switched to the specific product
- ✅ Kitchen Must-Haves - List including the specific product

### Travel Templates:
- ✅ Gear Breakdown - Review of the specific product
- ✅ Durability Test - Testing the specific product

### Pet Templates:
- ✅ Pet Testimonial - Testimonial about the specific product
- ✅ Grooming Transformation - Using the specific product

## GENERIC TEMPLATES (usesProduct: false)
These templates create general content that doesn't focus on the input product:

### Universal Templates:
- ⚠️ Routine Builder - Creates generic routines (may mention product but not product-focused)
- ⚠️ Bullet-Point Summary - Generic tips/facts (may loosely relate to product niche)
- ⚠️ Trending Explainer - General trend explanation (not product-specific)
- ⚠️ Buyer Persona Targeting - General audience-focused content

### Niche-Specific Generic Templates:
- ⚠️ What I Eat in a Day (Fitness) - General daily routine
- ⚠️ Myth Busting (Fitness) - General fitness myths
- ⚠️ Fitness Influencer Voice (Fitness) - General fitness advice
- ⚠️ Capsule Wardrobe (Fashion) - General wardrobe advice
- ⚠️ Outfit Inspiration (Fashion) - General outfit ideas
- ⚠️ Pinterest Style (Food) - General food styling
- ⚠️ Amazon Finds (Food) - General product roundups
- ⚠️ Adventure Packlist (Travel) - General packing advice
- ⚠️ Top Gear for Activity (Travel) - General gear recommendations
- ⚠️ Adventure Vlog (Travel) - General travel content
- ⚠️ Pet Owner Tips (Pet) - General pet care advice
- ⚠️ Pet Parent Guide (Pet) - General pet parenting
- ⚠️ Trainer Tip (Pet) - General training advice
- ⚠️ Top Use Cases (Tech) - General use case scenarios

## IMPLEMENTATION PLAN:
1. Add usesProduct and contentType fields to all template metadata
2. Create UI sections: "Product-Focused Templates" and "General Content Templates"  
3. Update template selector to group templates by these categories