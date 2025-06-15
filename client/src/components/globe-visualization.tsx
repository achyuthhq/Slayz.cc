import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Graticule,
  Sphere
} from "react-simple-maps";

// World map topology data
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

// ISO country codes for mapping country names to codes
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

interface CountryData {
  country: string;
  views: number;
}

interface GlobeVisualizationProps {
  data: CountryData[];
  totalViews: number;
}

export function GlobeVisualization({ data, totalViews }: GlobeVisualizationProps) {
  // Function to get color intensity based on view count
  const getColorIntensity = (countryName: string): string => {
    const country = data.find(d => 
      d.country.toLowerCase() === countryName.toLowerCase() || 
      countryCodes[d.country] === countryCodes[countryName]
    );
    
    if (!country) return "rgba(142, 68, 173, 0.1)";
    
    // Calculate percentage of total views
    const percentage = (country.views / totalViews);
    
    // Log for debugging
    console.log(`Country: ${countryName}, Views: ${country?.views}, Percentage: ${percentage}`);
    
    // Return color with opacity based on percentage (min 0.2, max 0.9)
    const opacity = 0.2 + (percentage * 3.5);
    const clampedOpacity = Math.min(0.9, Math.max(0.2, opacity));
    
    return `rgba(142, 68, 173, ${clampedOpacity})`;
  };
  
  // Map country names to ISO codes for marker placement
  const getCountryCoordinates = (): Array<[number, number, string, number]> => {
    return data
      .filter(d => {
        const code = countryCodes[d.country];
        return !!code; // Only include countries we have codes for
      })
      .map(d => {
        const countryCode = countryCodes[d.country];
        // These are approximate center coordinates for some major countries
        // In a production app, you'd have a more complete mapping
        switch(countryCode) {
          case "USA": return [-98, 39, d.country, d.views];
          case "GBR": return [-2, 54, d.country, d.views];
          case "CAN": return [-106, 56, d.country, d.views];
          case "AUS": return [133, -25, d.country, d.views];
          case "DEU": return [10, 51, d.country, d.views];
          case "FRA": return [2, 46, d.country, d.views];
          case "JPN": return [138, 36, d.country, d.views];
          case "CHN": return [105, 35, d.country, d.views];
          case "IND": return [78, 21, d.country, d.views];
          case "BRA": return [-53, -10, d.country, d.views];
          default: return [0, 0, d.country, d.views]; // Default to 0,0 for unknown
        }
      });
  };

  return (
    <div className="relative h-[300px] w-full">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        className="h-full w-full"
      >
        <Sphere
          id="globe-sphere"
          fill="transparent"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={0.5}
        />
        <Graticule
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.5}
        />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const countryName = geo.properties.name;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColorIntensity(countryName)}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { 
                      fill: "rgba(142, 68, 173, 0.8)", 
                      outline: "none",
                      cursor: "pointer" 
                    },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>
        
        {/* Place markers for top countries */}
        {getCountryCoordinates().map((marker, i) => (
          <Marker key={i} coordinates={[marker[0], marker[1]]}>
            <circle 
              r={Math.max(3, Math.min(8, marker[3] / totalViews * 50))} 
              fill="rgba(142, 68, 173, 0.8)" 
              stroke="#fff" 
              strokeWidth={0.5} 
            />
            <text
              textAnchor="middle"
              y={-10}
              style={{
                fontFamily: "system-ui",
                fill: "#fff",
                fontSize: "8px",
                fontWeight: "bold",
                textShadow: "0px 0px 2px #000"
              }}
            >
              {marker[2]}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}

export default GlobeVisualization; 