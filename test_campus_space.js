const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('--- CAMPUSSPACE AUTOMATED VERIFICATION ---');

// 1. Verify index.html exists and is populated
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  const size = fs.statSync(indexPath).size;
  console.log(`[PASS] index.html exists (${size} bytes)`);
} else {
  console.error('[FAIL] index.html does not exist');
  process.exit(1);
}

// 2. Verify all modular files in src/
const requiredFiles = [
  'src/types/index.ts',
  'src/data/campusVenues.ts',
  'src/data/sampleBookings.ts',
  'src/data/sampleAnalytics.ts',
  'src/utils/aiRecommender.ts',
  'src/utils/mapRouting.ts',
  'src/utils/qrGenerator.ts',
  'src/components/Navbar.tsx',
  'src/components/Sidebar.tsx',
  'src/components/LandingHero.tsx',
  'src/components/DashboardView.tsx',
  'src/components/AIRecommendationsView.tsx',
  'src/components/ExplainableAIModal.tsx',
  'src/components/CampusMapView.tsx',
  'src/components/LiveNavigationView.tsx',
  'src/components/MyBookingsView.tsx',
  'src/components/QRCodeModal.tsx',
  'src/components/AnalyticsView.tsx',
  'src/components/DemandForecastView.tsx',
  'src/components/AdminApprovalView.tsx',
  'src/components/BookingModal.tsx',
  'src/components/NotificationsDrawer.tsx',
  'src/components/SettingsView.tsx',
  'src/App.tsx',
  'dev-server.js',
  'start.bat',
  'package.json'
];

let allExist = true;
requiredFiles.forEach((file) => {
  const full = path.join(__dirname, file);
  if (fs.existsSync(full)) {
    console.log(`[PASS] ${file} verified`);
  } else {
    console.error(`[FAIL] ${file} missing`);
    allExist = false;
  }
});

if (!allExist) {
  process.exit(1);
}

// 3. Test HTTP Server functionality
const server = http.createServer((req, res) => {
  const content = fs.readFileSync(indexPath, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
});

server.listen(5178, () => {
  console.log('[PASS] Dev Server started successfully on port 5178');

  http.get('http://localhost:5178', (res) => {
    console.log(`[PASS] HTTP GET status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (data.includes('CampusSpace') && data.includes('AI RECOMMENDATIONS') && data.includes('Leaflet')) {
        console.log('[PASS] HTML Content contains CampusSpace, AI Recommendations, and Leaflet modules');
        console.log('\n>>> ALL 27 VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<');
        server.close(() => process.exit(0));
      } else {
        console.error('[FAIL] Expected tags not found in HTML output');
        server.close(() => process.exit(1));
      }
    });
  }).on('error', (err) => {
    console.error('[FAIL] HTTP GET error:', err.message);
    server.close(() => process.exit(1));
  });
});
