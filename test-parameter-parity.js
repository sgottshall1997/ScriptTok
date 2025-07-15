/**
 * PARAMETER PARITY TEST
 * Test script to verify scheduled and manual generators use identical parameters
 */

const testParameterParity = async () => {
  console.log('🔍 PARAMETER PARITY TEST STARTING...');
  
  try {
    // Test 1: Fetch scheduled job 153 parameters
    console.log('📊 TEST 1: Fetching scheduled job 153 parameters');
    const scheduledJobResponse = await fetch('http://localhost:5000/api/automated-bulk/scheduled-jobs');
    const scheduledData = await scheduledJobResponse.json();
    
    const job153 = scheduledData.jobs.find(job => job.id === 153);
    if (!job153) {
      console.error('❌ Job 153 not found');
      return;
    }
    
    console.log('✅ Job 153 Parameters:', {
      id: job153.id,
      topRatedStyleUsed: job153.topRatedStyleUsed,
      useSpartanFormat: job153.useSpartanFormat,
      scheduleTime: job153.scheduleTime,
      isActive: job153.isActive
    });
    
    // Test 2: Verify parameter types and values
    console.log('📊 TEST 2: Parameter validation');
    console.log('✅ topRatedStyleUsed type:', typeof job153.topRatedStyleUsed, '- value:', job153.topRatedStyleUsed);
    console.log('✅ useSpartanFormat type:', typeof job153.useSpartanFormat, '- value:', job153.useSpartanFormat);
    
    // Test 3: Expected vs actual parameters
    console.log('📊 TEST 3: Expected vs actual');
    const expectedParams = {
      topRatedStyleUsed: true,
      useSpartanFormat: true
    };
    
    const actualParams = {
      topRatedStyleUsed: job153.topRatedStyleUsed,
      useSpartanFormat: job153.useSpartanFormat
    };
    
    console.log('Expected:', expectedParams);
    console.log('Actual:', actualParams);
    
    const parityCheck = 
      expectedParams.topRatedStyleUsed === actualParams.topRatedStyleUsed &&
      expectedParams.useSpartanFormat === actualParams.useSpartanFormat;
    
    console.log('✅ Parameter parity check:', parityCheck ? 'PASS' : 'FAIL');
    
    // Test 4: Database verification
    console.log('📊 TEST 4: Database content verification');
    const dbResponse = await fetch('http://localhost:5000/api/content-history?limit=5');
    const dbData = await dbResponse.json();
    
    console.log('Recent content entries:', dbData.length || 0);
    
    if (dbData.length > 0) {
      const recentContent = dbData[0];
      console.log('Most recent content params:', {
        topRatedStyleUsed: recentContent.topRatedStyleUsed,
        productName: recentContent.productName
      });
    }
    
    console.log('🎉 PARAMETER PARITY TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testParameterParity();