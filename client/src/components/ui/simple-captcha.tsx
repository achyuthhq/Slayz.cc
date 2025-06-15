import React, { useState, useEffect, useMemo } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Card } from "./card";
import { Label } from "./label";

interface SimpleCaptchaProps {
  onChange: (isValid: boolean, token?: string | null) => void;
  className?: string;
}

// Random seed generator for consistent visuals
const randomBetween = (min: number, max: number, seed: number): number => {
  const random = Math.sin(seed) * 10000;
  return min + (random - Math.floor(random)) * (max - min);
};

export function SimpleCaptcha({ onChange, className = "" }: SimpleCaptchaProps) {
  const [captchaText, setCaptchaText] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(Date.now());
  
  // Seeds for each character's visual distortion
  const charSeeds = useMemo(() => 
    Array.from({ length: 10 }, () => Math.random() * 1000),
  [seed]);
  
  const generateCaptcha = () => {
    // Generate a random string of 6 characters
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput("");
    setIsValid(false);
    onChange(false, null);
    setSeed(Date.now());
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Case-insensitive comparison for better user experience
    const valid = value.toLowerCase() === captchaText.toLowerCase();
    setIsValid(valid);
    
    // If valid, use the captcha text as a pseudo-token
    // In a real implementation with Turnstile, this would be the actual token
    onChange(valid, valid ? captchaText : null);
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="p-4 bg-black-50 border-white/10">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="captcha-input" className="text-white/70">
              Enter the characters below
            </Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="text-sm text-purple-400 hover:text-purple-300" 
              onClick={generateCaptcha}
            >
              Refresh
            </Button>
          </div>
          
          <div className="relative">
            <div 
              className="captcha-display text-lg font-mono tracking-wide p-3 mb-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white rounded-md select-none overflow-hidden"
              style={{
                fontFamily: "monospace",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                letterSpacing: "0.25rem",
                textAlign: "center",
                fontWeight: "bold",
                // Add visual noise and distortion to make it harder for bots
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px)",
                textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
                position: "relative"
              }}
            >
              {/* Random noise lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  style={{
                    position: "absolute",
                    top: `${randomBetween(0, 100, seed + i * 100)}%`,
                    left: 0,
                    width: "100%",
                    height: "1px",
                    background: `rgba(255,255,255,${randomBetween(0.1, 0.4, seed + i * 200)})`,
                    transform: `rotate(${randomBetween(-10, 10, seed + i * 300)}deg)`
                  }}
                />
              ))}
              
              {/* Individual characters with random styling for added complexity */}
              <div className="flex justify-center">
                {captchaText.split('').map((char, index) => (
                  <span
                    key={index}
                    style={{
                      display: "inline-block",
                      transform: `translateY(${randomBetween(-3, 3, charSeeds[index] * 10)}px) rotate(${randomBetween(-5, 5, charSeeds[index] * 20)}deg)`,
                      fontSize: `${1 + randomBetween(0, 0.4, charSeeds[index] * 30)}em`,
                      opacity: 0.8 + randomBetween(0, 0.2, charSeeds[index] * 40),
                      filter: `blur(${randomBetween(0, 0.5, charSeeds[index] * 50)}px)`,
                      textShadow: `${randomBetween(-2, 2, charSeeds[index] * 60)}px ${randomBetween(-1, 1, charSeeds[index] * 70)}px 2px rgba(0,0,0,0.3)`,
                      color: index % 2 === 0 ? 'rgb(240, 240, 255)' : 'rgb(255, 240, 255)'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
            
            <Input
              id="captcha-input"
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the characters above"
              className="bg-[#0c0c0c] border-2 border-transparent rounded-md text-[#eee] py-2 px-3 w-full transition-all duration-300 outline-none hover:border-gray-800 focus:border-gray-700"
              autoComplete="off"
            />
            
            {userInput && (
              <div className="mt-2 text-sm">
                {isValid ? (
                  <div className="flex items-center space-x-2 text-green-500">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 animate-pulse" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Verification successful!</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-500">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Characters don't match. Try again.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}