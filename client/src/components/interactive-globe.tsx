import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import GlobeGL from 'globe.gl';
import * as THREE from 'three';
import { ThemeProviderContext } from '@/components/theme-provider';
import { useContext } from 'react';
import './interactive-globe.css'; // Import external CSS file for tooltip styles

// Country data type
interface CountryData {
  country: string;
  views: number;
}

interface CountryFeature {
  type: string;
  properties: {
    name: string;
    code?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

// Additional types to address TypeScript errors
interface CountryWithValue extends CountryFeature {
  views?: number;
  percentage?: number;
  value?: number;
}

interface PointData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  views: number;
  country: string;
  percentage: number;
  x?: number;
  y?: number;
}

interface InteractiveGlobeProps {
  data: CountryData[];
  totalViews: number;
  className?: string;
}

// ISO country codes for mapping country names to codes (for more accurate identification)
const countryCodes: Record<string, string> = {
  "United States": "USA",
  "USA": "USA",
  "United States of America": "USA",
  "UK": "GBR",
  "United Kingdom": "GBR",
  "Great Britain": "GBR",
  "Canada": "CAN",
  "Australia": "AUS",
  "Germany": "DEU",
  "France": "FRA",
  "Japan": "JPN",
  "China": "CHN",
  "India": "IND",
  "Brazil": "BRA",
  "Russia": "RUS",
  "South Korea": "KOR",
  "Mexico": "MEX",
  "Spain": "ESP",
  "Italy": "ITA",
  "Netherlands": "NLD",
  "Sweden": "SWE",
  "Switzerland": "CHE",
  "Norway": "NOR",
  "Denmark": "DNK",
  "Finland": "FIN",
  "Ireland": "IRL",
  "Belgium": "BEL",
  "Austria": "AUT",
  "New Zealand": "NZL",
  "Singapore": "SGP",
  "Malaysia": "MYS",
  "Indonesia": "IDN",
  "Thailand": "THA",
  "Vietnam": "VNM",
  "Philippines": "PHL",
  "South Africa": "ZAF",
  "Nigeria": "NGA",
  "Egypt": "EGY",
  "Kenya": "KEN",
  "Morocco": "MAR",
  "Turkey": "TUR",
  "Israel": "ISR",
  "Saudi Arabia": "SAU",
  "UAE": "ARE",
  "United Arab Emirates": "ARE",
  "Argentina": "ARG",
  "Chile": "CHL",
  "Colombia": "COL",
  "Peru": "PER",
  "Venezuela": "VEN",
  "Poland": "POL",
  "Ukraine": "UKR",
  "Greece": "GRC",
  "Portugal": "PRT",
  "Romania": "ROU",
  "Hungary": "HUN",
  "Czech Republic": "CZE",
  "Pakistan": "PAK",
  "Bangladesh": "BGD",
  "Sri Lanka": "LKA",
  "Iran": "IRN",
  "Iraq": "IRQ",
};

export function InteractiveGlobe({ data, totalViews, className = "" }: InteractiveGlobeProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const themeContext = useContext(ThemeProviderContext);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{
    country: string;
    views: number;
    percentage: string;
    x: number;
    y: number;
  } | null>(null);

  // Prepare enhanced data for visualization
  const enhancedData = useMemo(() => {
    if (!countries.length) return [];

    return countries.map(country => {
      const countryName = country.properties.name;
      const matchedData = data.find(d => 
        d.country.toLowerCase() === countryName.toLowerCase() || 
        (countryCodes[d.country] && countryCodes[countryName] && 
         countryCodes[d.country] === countryCodes[countryName])
      );
      
      const views = matchedData?.views || 0;
      const percentage = totalViews > 0 ? (views / totalViews) * 100 : 0;
      
      return {
        ...country,
        views,
        percentage,
        // For altitude and color calculations
        value: percentage
      };
    }) as CountryWithValue[];
  }, [countries, data, totalViews]);

  // Load country GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(({ features }) => {
        setCountries(features);
      })
      .catch(error => {
        console.error('Error loading country data:', error);
      });
  }, []);

  // Initialize and configure the globe
  useEffect(() => {
    if (!globeEl.current || !enhancedData.length) return;

    // Check if globe already initialized
    if (!globeInstance.current) {
      // Create new Globe instance with correct instantiation
      const Globe = GlobeGL();
      globeInstance.current = Globe(globeEl.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeEl.current.clientWidth)
        .height(globeEl.current.clientHeight)
        .polygonsData(enhancedData)
        .polygonCapColor((d: CountryWithValue) => {
          const value = d.value || 0;
          if (value === 0) return 'rgba(142, 68, 173, 0.1)';
          
          // Color gradient based on percentage
          const intensity = Math.min(0.9, Math.max(0.2, 0.2 + value * 0.04));
          return `rgba(142, 68, 173, ${intensity})`;
        })
        .polygonSideColor(() => 'rgba(142, 68, 173, 0.05)')
        .polygonStrokeColor(() => '#8e44ad')
        .polygonAltitude((d: CountryWithValue) => (d.value || 0) * 0.02)
        .polygonLabel((d: CountryWithValue) => {
          const country = d.properties?.name || 'Unknown';
          const views = d.views || 0;
          const percentage = d.percentage ? d.percentage.toFixed(1) : '0.0';
          
          return `
            <div class="globe-tooltip">
              <div class="tooltip-header">${country}</div>
              <div class="tooltip-content">
                <div class="tooltip-row">
                  <span>Views:</span> <span class="value">${views}</span>
                </div>
                <div class="tooltip-row">
                  <span>% of Total:</span> <span class="value">${percentage}%</span>
                </div>
              </div>
            </div>
          `;
        })
        .onPolygonHover((d: CountryWithValue | null) => {
          if (d) {
            setHoveredCountry(d.properties.name);
          } else {
            setHoveredCountry(null);
          }
        })
        .polygonsTransitionDuration(300)
        .showAtmosphere(true)
        .atmosphereColor('#8e44ad')
        .atmosphereAltitude(0.1)
        .showGraticules(true)
        .enablePointerInteraction(true);

      // Add points for top countries
      const pointsData = data
        .filter(d => d.views > 0)
        .map(d => {
          const countryCode = Object.entries(countryCodes).find(([name]) => 
            name.toLowerCase() === d.country.toLowerCase()
          )?.[1];
          
          // Find country in GeoJSON
          const countryFeature = countries.find(country => 
            country.properties.name === d.country || 
            (country.properties.code && countryCode && country.properties.code === countryCode)
          );
          
          if (!countryFeature) return null;
          
          // Get centroid of country polygon
          const coordinates = getCentroid(countryFeature.geometry.coordinates);
          if (!coordinates) return null;
          
          return {
            lat: coordinates[1],
            lng: coordinates[0],
            size: Math.max(0.5, Math.min(3, (d.views / totalViews) * 25)),
            color: '#8e44ad',
            views: d.views,
            country: d.country,
            percentage: (d.views / totalViews) * 100
          };
        })
        .filter(Boolean) as PointData[];

      globeInstance.current
        .pointsData(pointsData)
        .pointColor('color')
        .pointAltitude(0.02)
        .pointRadius('size')
        .pointsMerge(true)
        .pointLabel((d: PointData) => `${d.country}: ${d.views} views (${d.percentage.toFixed(1)}%)`)
        .onPointHover((point: PointData | null) => {
          if (point) {
            setTooltipContent({
              country: point.country,
              views: point.views,
              percentage: point.percentage.toFixed(1),
              x: point.x || 0,
              y: point.y || 0
            });
          } else {
            setTooltipContent(null);
          }
        });

      // Initial position
      globeInstance.current.pointOfView({ lat: 30, lng: 10, altitude: 2.5 });
      
      // Auto-rotate animation
      let currentLng = 10;
      const autoRotate = () => {
        currentLng += 0.1;
        if (globeInstance.current) {
          const { lat, altitude } = globeInstance.current.pointOfView();
          globeInstance.current.pointOfView({ lat, lng: currentLng, altitude });
        }
        requestAnimationFrame(autoRotate);
      };
      
      // Only auto-rotate if not interacting
      let rotationFrame: number;
      let isInteracting = false;
      
      globeEl.current.addEventListener('mousedown', () => {
        isInteracting = true;
        cancelAnimationFrame(rotationFrame);
      });
      
      globeEl.current.addEventListener('mouseup', () => {
        isInteracting = false;
        rotationFrame = requestAnimationFrame(autoRotate);
      });
      
      globeEl.current.addEventListener('mouseleave', () => {
        if (!isInteracting) {
          rotationFrame = requestAnimationFrame(autoRotate);
        }
      });
      
      // Start auto-rotation
      rotationFrame = requestAnimationFrame(autoRotate);
      
      // Cleanup on unmount
      return () => {
        cancelAnimationFrame(rotationFrame);
        if (globeInstance.current) {
          globeInstance.current._destructor();
        }
      };
    } else {
      // Update existing globe
      globeInstance.current
        .polygonsData(enhancedData)
        .width(globeEl.current.clientWidth)
        .height(globeEl.current.clientHeight);
    }
  }, [enhancedData, themeContext?.theme]);

  // Handle window resize
  useEffect(() => {
    if (!globeInstance.current) return;
    
    const handleResize = () => {
      if (globeEl.current && globeInstance.current) {
        globeInstance.current
          .width(globeEl.current.clientWidth)
          .height(globeEl.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to find approximate centroid of country
  const getCentroid = useCallback((coordinates: any) => {
    try {
      // Handle different geometry types
      if (!coordinates || !coordinates.length) return null;
      
      // MultiPolygon - use the largest polygon
      if (coordinates.length > 1 && Array.isArray(coordinates[0][0])) {
        let maxSize = 0;
        let largestPolygon = coordinates[0];
        
        coordinates.forEach((polygon: any) => {
          const size = polygon.flat().length;
          if (size > maxSize) {
            maxSize = size;
            largestPolygon = polygon;
          }
        });
        
        coordinates = largestPolygon;
      }
      
      // Get the first polygon if it's a multi-polygon
      if (Array.isArray(coordinates[0][0][0])) {
        coordinates = coordinates[0];
      }
      
      // Get coordinates from polygon
      const flatCoords = coordinates.flat();
      
      // Calculate centroid
      let lng = 0, lat = 0;
      let pointCount = 0;
      
      for (let i = 0; i < flatCoords.length; i++) {
        if (Array.isArray(flatCoords[i]) && flatCoords[i].length >= 2) {
          lng += flatCoords[i][0];
          lat += flatCoords[i][1];
          pointCount++;
        }
      }
      
      if (pointCount === 0) return null;
      return [lng / pointCount, lat / pointCount];
    } catch (e) {
      console.error('Error calculating centroid:', e);
      return null;
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={globeEl} 
        className="w-full h-[350px] rounded-lg overflow-hidden" 
      />
      
      {/* Custom tooltip */}
      {tooltipContent && (
        <div 
          className="absolute bg-black/90 border border-[#8e44ad]/50 rounded-lg px-3 py-2 text-white text-sm z-50 pointer-events-none"
          style={{
            left: tooltipContent.x + 15 + 'px',
            top: tooltipContent.y - 10 + 'px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="font-bold text-[#8e44ad]">{tooltipContent.country}</div>
          <div className="flex justify-between gap-4">
            <span>Views:</span>
            <span className="font-mono">{tooltipContent.views}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>% of Total:</span>
            <span className="font-mono">{tooltipContent.percentage}%</span>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button 
          className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-[#8e44ad]/50 transition-colors"
          onClick={() => {
            if (globeInstance.current) {
              const { lat, lng, altitude } = globeInstance.current.pointOfView();
              globeInstance.current.pointOfView({ lat, lng, altitude: altitude * 0.8 });
            }
          }}
        >
          <span className="text-white text-lg">+</span>
        </button>
        <button 
          className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-[#8e44ad]/50 transition-colors"
          onClick={() => {
            if (globeInstance.current) {
              const { lat, lng, altitude } = globeInstance.current.pointOfView();
              globeInstance.current.pointOfView({ lat, lng, altitude: altitude * 1.2 });
            }
          }}
        >
          <span className="text-white text-lg">-</span>
        </button>
        <button 
          className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-[#8e44ad]/50 transition-colors"
          onClick={() => {
            if (globeInstance.current) {
              globeInstance.current.pointOfView({ lat: 30, lng: 10, altitude: 2.5 });
            }
          }}
        >
          <span className="text-white text-xs">Reset</span>
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        <div className="text-xs text-white/80 mb-1">Views Intensity</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[rgba(142,68,173,0.2)]"></div>
          <div className="text-xs text-white/60">Low</div>
          <div className="mx-1 text-white/40">→</div>
          <div className="w-3 h-3 rounded-sm bg-[rgba(142,68,173,0.9)]"></div>
          <div className="text-xs text-white/60">High</div>
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