/**
 * Discord API Status Checker
 * 
 * This utility checks the Discord API status to help troubleshoot connection issues.
 * It verifies if the Discord API endpoints are reachable and responding correctly.
 */

// Simplified representation of Discord API status
export interface DiscordAPIStatus {
  operational: boolean;
  issues: string[];
  checkedAt: string;
  endpoints: {
    [key: string]: {
      operational: boolean;
      status: number;
      responseTime?: number;
    };
  };
}

/**
 * Check if the Discord API is operational by making test requests
 * to key endpoints that don't require authentication
 */
export async function checkDiscordAPIStatus(): Promise<DiscordAPIStatus> {
  console.log('[Discord Status] Checking Discord API status...');
  
  const status: DiscordAPIStatus = {
    operational: true,
    issues: [],
    checkedAt: new Date().toISOString(),
    endpoints: {}
  };
  
  // Define endpoints to check
  const endpoints = [
    { name: 'base', url: 'https://discord.com/api/v10' },
    { name: 'oauth', url: 'https://discord.com/api/v10/oauth2/applications/@me' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = performance.now();
      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'DiscordStatusChecker/1.0'
        }
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      status.endpoints[endpoint.name] = {
        operational: response.status < 500,
        status: response.status,
        responseTime
      };
      
      if (response.status >= 500) {
        status.operational = false;
        status.issues.push(`${endpoint.name} endpoint returned ${response.status}`);
      }
      
      console.log(`[Discord Status] ${endpoint.name} endpoint: status ${response.status}, ${responseTime}ms`);
    } catch (error) {
      console.error(`[Discord Status] Error checking ${endpoint.name} endpoint:`, error);
      
      status.endpoints[endpoint.name] = {
        operational: false,
        status: 0
      };
      
      status.operational = false;
      status.issues.push(`${endpoint.name} endpoint unreachable: ${(error as Error).message}`);
    }
  }
  
  // Log overall status
  console.log('[Discord Status] Overall status:', status.operational ? 'operational' : 'issues detected', status.issues);
  
  return status;
}

/**
 * Check the network connectivity by making a request to a reliable endpoint
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com', { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[Discord Status] Network connectivity check failed:', error);
    return false;
  }
}

/**
 * Run all checks and return a full diagnostic report
 */
export async function runDiscordDiagnostics(): Promise<{
  networkConnectivity: boolean;
  apiStatus: DiscordAPIStatus;
  recommendations: string[];
}> {
  console.log('[Discord Status] Running diagnostics...');
  
  const networkConnectivity = await checkNetworkConnectivity();
  const apiStatus = await checkDiscordAPIStatus();
  
  const recommendations: string[] = [];
  
  if (!networkConnectivity) {
    recommendations.push('Check your internet connection - unable to reach Google.com');
  }
  
  if (!apiStatus.operational) {
    if (networkConnectivity) {
      recommendations.push('Discord API appears to be experiencing issues. Try again later.');
      
      // Add specific recommendations based on issues
      for (const issue of apiStatus.issues) {
        if (issue.includes('oauth')) {
          recommendations.push('Discord OAuth service may be down - authentication will fail until resolved.');
        }
      }
    } else {
      recommendations.push('Your network connection is preventing access to Discord API.');
    }
  }
  
  if (recommendations.length === 0 && networkConnectivity && apiStatus.operational) {
    recommendations.push('Discord API appears operational. Check your application credentials and configuration.');
  }
  
  return {
    networkConnectivity,
    apiStatus,
    recommendations
  };
}

/**
 * Add a button to the page that shows Discord API status
 */
export function addDiscordStatusButton(containerId: string = 'discord-status-container'): void {
  if (typeof document === 'undefined') return;
  
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const button = document.createElement('button');
  button.className = 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm mt-4';
  button.textContent = 'Check Discord API Status';
  button.onclick = async () => {
    button.textContent = 'Checking...';
    button.disabled = true;
    
    try {
      const diagnostics = await runDiscordDiagnostics();
      
      // Create or get results container
      let resultsContainer = document.getElementById('discord-status-results');
      if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'discord-status-results';
        resultsContainer.className = 'mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm';
        container.appendChild(resultsContainer);
      }
      
      // Update results
      resultsContainer.innerHTML = `
        <h4 class="font-bold mb-2">Discord API Status</h4>
        <p>Network Connectivity: ${diagnostics.networkConnectivity ? '✅ Connected' : '❌ Issues'}</p>
        <p>Discord API: ${diagnostics.apiStatus.operational ? '✅ Operational' : '❌ Issues'}</p>
        ${diagnostics.apiStatus.issues.length > 0 ? 
          `<p class="mt-2 font-bold">Issues:</p>
           <ul class="list-disc pl-5">
             ${diagnostics.apiStatus.issues.map(issue => `<li>${issue}</li>`).join('')}
           </ul>` : ''}
        <p class="mt-2 font-bold">Recommendations:</p>
        <ul class="list-disc pl-5">
          ${diagnostics.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
        <p class="mt-2 text-xs text-gray-500">Checked at: ${new Date().toLocaleTimeString()}</p>
      `;
    } catch (error) {
      console.error('[Discord Status] Error running diagnostics:', error);
    } finally {
      button.textContent = 'Check Discord API Status';
      button.disabled = false;
    }
  };
  
  container.appendChild(button);
}

// For convenience, expose this globally in development
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  (window as any).checkDiscordStatus = runDiscordDiagnostics;
} 