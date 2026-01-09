// Quick diagnostic to check localStorage state
const fs = require('fs');

console.log('\n=== CHECKING CHALLENGE/TAB STATE ===\n');

// This would normally run in browser, but let's create a diagnostic page
const html = `<!DOCTYPE html>
<html>
<head><title>State Checker</title></head>
<body>
<h1>Checking localStorage...</h1>
<pre id="output"></pre>
<script>
const output = document.getElementById('output');
let result = '';

// Check tabs
const tabsRaw = localStorage.getItem('tabs_v1');
const tabs = tabsRaw ? JSON.parse(tabsRaw) : [];
result += 'TABS (' + tabs.length + '):\\n';
tabs.forEach((tab, i) => {
  result += '  [' + i + '] ' + tab.name + ' (id: ' + tab.id + ')\\n';
});

// Check active tab
const activeTabId = localStorage.getItem('active_tab_v1');
result += '\\nACTIVE TAB ID: ' + (activeTabId || 'NONE') + '\\n';

// Check challenges
const dataRaw = localStorage.getItem('autism_friendly_challenges');
const data = dataRaw ? JSON.parse(dataRaw) : { challenges: [] };
result += '\\nCHALLENGES (' + data.challenges.length + '):\\n';
data.challenges.forEach((c, i) => {
  result += '  [' + i + '] ' + c.text.substring(0, 40) + '...';
  result += ' (tabId: ' + (c.tabId || 'NONE') + ')\\n';
});

// Check if tabIds match
result += '\\n=== ANALYSIS ===\\n';
const tabIds = tabs.map(t => t.id);
const challengeTabIds = data.challenges.map(c => c.tabId).filter(Boolean);
const orphanedChallenges = data.challenges.filter(c => c.tabId && !tabIds.includes(c.tabId));

result += 'Tab IDs: ' + JSON.stringify(tabIds) + '\\n';
result += 'Challenge Tab IDs: ' + JSON.stringify([...new Set(challengeTabIds)]) + '\\n';
result += 'Orphaned challenges (tabId doesn\\'t match any tab): ' + orphanedChallenges.length + '\\n';

if (orphanedChallenges.length > 0) {
  result += '\\n⚠️ PROBLEM FOUND: Challenges have tabIds that don\\'t match any existing tab!\\n';
  result += '\\nSOLUTION: Run this fix:\\n';
  result += '  const firstTabId = tabs[0].id;\\n';
  result += '  data.challenges.forEach(c => { c.tabId = firstTabId; });\\n';
  result += '  localStorage.setItem("autism_friendly_challenges", JSON.stringify(data));\\n';
  result += '  localStorage.setItem("active_tab_v1", firstTabId);\\n';
}

output.textContent = result;
console.log(result);
</script>
</body>
</html>`;

fs.writeFileSync('/home/user/AutIT/check-state.html', html);
console.log('Created check-state.html - open this in your browser to diagnose');
