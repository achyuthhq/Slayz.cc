/**
 * Environment Variables Validator
 * 
 * This utility checks if required environment variables are set correctly
 * and provides helpful warnings and diagnostics.
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingVariables: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Validate Discord-related environment variables
 */
export function validateDiscordEnv(): EnvValidationResult {
  // Create default result
  const result: EnvValidationResult = {
    isValid: true,
    missingVariables: [],
    warnings: [],
    recommendations: []
  };
  
  try {
    // Server-side environment variables
    if (typeof process !== 'undefined' && process.env) {
      // Required server environment variables
      const requiredServerVars = [
        'DISCORD_CLIENT_ID',
        'DISCORD_CLIENT_SECRET',
        'DISCORD_REDIRECT_URI'
      ];
      
      for (const varName of requiredServerVars) {
        if (!process.env[varName]) {
          result.isValid = false;
          result.missingVariables.push(varName);
          result.warnings.push(`Missing server environment variable: ${varName}`);
        }
      }
      
      // Check for common issues
      if (process.env.DISCORD_REDIRECT_URI && !process.env.DISCORD_REDIRECT_URI.startsWith('http')) {
        result.warnings.push('DISCORD_REDIRECT_URI should start with http:// or https://');
      }
      
      if (process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_SECRET.length < 10) {
        result.warnings.push('DISCORD_CLIENT_SECRET appears to be too short to be valid');
      }
    }
    
    // Client-side environment variables
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env) {
      // Required client environment variables
      const requiredClientVars = [
        'NEXT_PUBLIC_DISCORD_CLIENT_ID',
        'NEXT_PUBLIC_DISCORD_REDIRECT_URI'
      ];
      
      for (const varName of requiredClientVars) {
        if (!process.env[varName]) {
          result.isValid = false;
          result.missingVariables.push(varName);
          result.warnings.push(`Missing client environment variable: ${varName}`);
        }
      }
    }
    
    // Add recommendations based on issues found
    if (result.missingVariables.length > 0) {
      result.recommendations.push(
        'Create or update your .env file with the missing variables'
      );
      
      // Suggest exact format
      result.recommendations.push(`
Add these to your .env file:
${result.missingVariables.map(v => `${v}=your_value_here`).join('\n')}
      `.trim());
    }
    
    // Check for client/server mismatches
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.DISCORD_CLIENT_ID && process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID &&
          process.env.DISCORD_CLIENT_ID !== process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
        result.warnings.push('DISCORD_CLIENT_ID and NEXT_PUBLIC_DISCORD_CLIENT_ID have different values');
        result.recommendations.push('Ensure both DISCORD_CLIENT_ID and NEXT_PUBLIC_DISCORD_CLIENT_ID have the same value');
      }
      
      if (process.env.DISCORD_REDIRECT_URI && process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI &&
          process.env.DISCORD_REDIRECT_URI !== process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI) {
        result.warnings.push('DISCORD_REDIRECT_URI and NEXT_PUBLIC_DISCORD_REDIRECT_URI have different values');
        result.recommendations.push('Ensure both DISCORD_REDIRECT_URI and NEXT_PUBLIC_DISCORD_REDIRECT_URI have the same value');
      }
    }
  } catch (error) {
    console.warn('[EnvValidator] Error validating environment:', error);
    result.warnings.push('Error validating environment variables');
    result.recommendations.push('Check browser console for detailed error message');
  }
  
  return result;
}

/**
 * Run a comprehensive check of all environment variables
 */
export function validateAllEnvironmentVariables(): Record<string, EnvValidationResult> {
  try {
    return {
      discord: validateDiscordEnv()
    };
  } catch (error) {
    console.warn('[EnvValidator] Error running validation:', error);
    return {
      discord: {
        isValid: false,
        missingVariables: [],
        warnings: ['Error running environment validation'],
        recommendations: ['Check browser console for detailed error message']
      }
    };
  }
}

/**
 * Log validation results to console
 */
export function logEnvironmentValidation(): void {
  try {
    console.log('[Env Validator] Checking environment variables...');
    
    const results = validateAllEnvironmentVariables();
    
    let hasIssues = false;
    
    for (const [service, result] of Object.entries(results)) {
      if (!result.isValid) {
        hasIssues = true;
        console.warn(`[Env Validator] ⚠️ ${service} environment configuration has issues:`);
        
        for (const warning of result.warnings) {
          console.warn(`  - ${warning}`);
        }
        
        if (result.recommendations.length > 0) {
          console.info('[Env Validator] Recommendations:');
          for (const rec of result.recommendations) {
            console.info(`  - ${rec}`);
          }
        }
      } else {
        console.log(`[Env Validator] ✅ ${service} environment variables are properly configured`);
      }
    }
    
    if (!hasIssues) {
      console.log('[Env Validator] ✅ All environment variables are properly configured');
    }
  } catch (error) {
    console.warn('[EnvValidator] Error logging validation results:', error);
  }
}

// Only run validation in development and only in the browser environment
// Also add a try/catch to prevent crashes
try {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    // Delay to ensure it doesn't block initial rendering
    setTimeout(() => {
      try {
        logEnvironmentValidation();
      } catch (error) {
        console.warn('[EnvValidator] Error during validation:', error);
      }
    }, 2000);
  }
} catch (error) {
  // Silent catch to prevent app from crashing
} 