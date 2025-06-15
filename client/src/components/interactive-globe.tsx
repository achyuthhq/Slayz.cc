import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ThemeProviderContext } from '@/components/theme-provider';
import { useContext } from 'react';
import './interactive-globe.css'; // Import external CSS file for tooltip styles

// Country data type
interface CountryData {
  country: string;
  views: number;
}

interface InteractiveGlobeProps {
  data: CountryData[];
  totalViews: number;
  className?: string;
}

// Simplified fallback component instead of using globe.gl
export function InteractiveGlobe({ data, totalViews, className = "" }: InteractiveGlobeProps) {
  const themeContext = useContext(ThemeProviderContext);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  
  // Sort data by views (descending)
  const sortedData = useMemo(() => {
    return [...data]
      .filter(item => item.views > 0)
      .sort((a, b) => b.views - a.views);
  }, [data]);
          
  // Calculate max views for scaling
  const maxViews = useMemo(() => {
    if (sortedData.length === 0) return 1;
    return Math.max(...sortedData.map(item => item.views));
  }, [sortedData]);

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-[350px] rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm p-4 border border-purple-500/20">
        <h3 className="text-center text-white mb-4">Visitor Geography</h3>
      
        {/* Fallback visualization */}
        <div className="h-[250px] overflow-y-auto pr-2">
          {sortedData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60">
              No geographic data available
            </div>
          ) : (
            <div className="space-y-2">
              {sortedData.map((item, index) => {
                const percentage = totalViews > 0 ? (item.views / totalViews) * 100 : 0;
                const barWidth = `${Math.max(5, (item.views / maxViews) * 100)}%`;
                
                return (
                  <div 
                    key={index}
                    className="relative"
                    onMouseEnter={() => setHoveredCountry(item.country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                      <span>{item.country}</span>
                      <span>{item.views} views ({percentage.toFixed(1)}%)</span>
          </div>
                    <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: barWidth }}
                      />
          </div>
                  </div>
                );
              })}
        </div>
      )}
      </div>
      
      {/* Legend */}
        <div className="mt-4 flex justify-between items-center text-xs text-white/70">
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-purple-600/90"></div>
            <span>Views by country</span>
          </div>
          <div>Total: {totalViews} views</div>
        </div>
      </div>
      
      {/* Country name display */}
      {hoveredCountry && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10">
          <div className="text-white font-medium">{hoveredCountry}</div>
        </div>
      )}
    </div>
  );
}

export default InteractiveGlobe; 