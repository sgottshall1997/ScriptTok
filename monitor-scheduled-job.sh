#!/bin/bash

echo "🕐 SCHEDULED JOB MONITOR - Starting real-time monitoring"
echo "⏰ Job scheduled to run at 7:55 PM EST (3 minutes from now)"
echo "📍 Current time: $(date)"
echo ""

# Monitor logs for scheduled job execution
echo "👁️ Monitoring server logs for scheduled job execution..."
echo "🔍 Looking for: 'CRON EXECUTION', 'SCHEDULED JOB', 'BULK JOB'"
echo ""

# Function to check job status
check_job_status() {
    echo "📊 Current system status:"
    curl -s http://localhost:5000/api/system-status | jq -r '.systemStatus | "Active bulk jobs: \(.activeBulkJobs), Scheduled jobs: \(.activeScheduledJobs)"'
    echo ""
}

# Function to check recent bulk jobs
check_recent_jobs() {
    echo "📋 Recent bulk jobs:"
    curl -s "http://localhost:5000/api/bulk-jobs?limit=3" | jq -r '.jobs[] | "Job \(.jobId): \(.status) - \(.completedVariations)/\(.totalVariations) - Created: \(.createdAt)"'
    echo ""
}

# Initial status check
check_job_status
check_recent_jobs

echo "🚀 Monitoring will run for 10 minutes or until job completes..."
echo "=================================================="

# Monitor for 10 minutes (600 seconds)
for i in {1..60}; do
    sleep 10
    
    current_time=$(date)
    echo "[$i/60] $current_time - Checking..."
    
    # Check for new bulk jobs
    new_jobs=$(curl -s "http://localhost:5000/api/bulk-jobs?limit=1" | jq -r '.jobs[0] // empty | select(.createdAt > "'$(date -d '1 minute ago' -Iseconds)'") | "🎯 NEW JOB: \(.jobId) - Status: \(.status)"')
    
    if [ ! -z "$new_jobs" ]; then
        echo "$new_jobs"
        check_job_status
        check_recent_jobs
        
        # If we found a new job, monitor it more closely
        echo "🔍 Monitoring new job progress..."
        for j in {1..10}; do
            sleep 5
            progress=$(curl -s "http://localhost:5000/api/bulk-jobs?limit=1" | jq -r '.jobs[0] | "Progress: \(.completedVariations)/\(.totalVariations) (\(.status))"')
            echo "   [$j/10] $progress"
            
            # Check if completed
            status=$(curl -s "http://localhost:5000/api/bulk-jobs?limit=1" | jq -r '.jobs[0].status')
            if [ "$status" = "completed" ]; then
                echo "✅ Job completed successfully!"
                break 2
            fi
        done
    fi
    
    # Check every 5 cycles (50 seconds)
    if [ $((i % 5)) -eq 0 ]; then
        check_job_status
    fi
done

echo ""
echo "⏰ Monitoring complete. Final status check:"
check_job_status
check_recent_jobs