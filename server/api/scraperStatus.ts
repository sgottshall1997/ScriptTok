import { Router } from "express";
import { storage } from "../storage";
import { SCRAPER_PLATFORMS } from "../../shared/constants";

const router = Router();

/**
 * Get detailed status for all scrapers with error reasons
 */
router.get("/", async (req, res) => {
  try {
    // Get the status of all scrapers
    const scraperStatuses = await Promise.all(
      SCRAPER_PLATFORMS.map(async (platform) => {
        const statuses = await storage.getScraperStatus();
        const status = statuses.find(s => s.name === platform);
        
        let statusOutput = {
          name: platform,
          status: "unknown",
          lastCheck: new Date().toISOString(),
          successCount: 0,
          failureCount: 0,
          errorMessage: ""
        };

        if (status) {
          // We need to handle both old and new status format
          
          // Get the status from the legacy format
          statusOutput.status = status.status;
          statusOutput.errorMessage = status.errorMessage || "";
          
          // Convert timestamp if it exists
          if (status.lastCheck) {
            statusOutput.lastCheck = status.lastCheck.toISOString();
          }
          
          // For newer style statuses with more information
          if ('realDataCount' in status) {
            // This is a newer format with more detail
            const realCount = (status as any).realDataCount || 0;
            const aiCount = (status as any).aiDataCount || 0;
            
            // Check if scraper is using GPT fallback
            if (status.status === "active" && aiCount > 0 && realCount === 0) {
              statusOutput.status = "gpt-fallback";
              statusOutput.errorMessage = (status as any).message || "Using AI data generation";
            }
            
            // Add additional context
            if ((status as any).timestamp) {
              statusOutput.lastCheck = new Date((status as any).timestamp).toISOString();
            }
            
            statusOutput.successCount = realCount;
            statusOutput.failureCount = aiCount;
          }
        }

        // If the scraper has an error status, classify the error reason
        if (statusOutput.status === "error" && statusOutput.errorMessage) {
          // Common error reasons to classify
          if (statusOutput.errorMessage.includes("429") || 
              statusOutput.errorMessage.includes("throttled") ||
              statusOutput.errorMessage.includes("rate limit")) {
            statusOutput.status = "rate-limited";
            statusOutput.errorMessage = "Rate limited by source platform";
          } 
          else if (statusOutput.errorMessage.includes("403") || 
                  statusOutput.errorMessage.includes("401") || 
                  statusOutput.errorMessage.includes("unauthorized")) {
            statusOutput.status = "auth-error";
            statusOutput.errorMessage = "Authentication error with source platform";
          }
          else if (statusOutput.errorMessage.includes("parse") || 
                  statusOutput.errorMessage.includes("extract")) {
            statusOutput.status = "parse-error";
            statusOutput.errorMessage = "Failed to parse data from source platform";
          }
        }

        return statusOutput;
      })
    );

    res.json(scraperStatuses);
  } catch (error) {
    console.error("Error fetching scraper status:", error);
    res.status(500).json({
      error: "Failed to fetch scraper status",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as scraperStatusRouter };