import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, className = "" }) => {
  return (
    <div className="w-full max-w-md relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#8e44ad]/20 to-[#9b59b6]/5 blur-xl opacity-50 rounded-3xl transform scale-110"></div>
      
      {/* The card itself */}
      <div className={`border border-[#8e44ad]/70 bg-black/60 backdrop-blur-xl p-6 space-y-6 shadow-lg shadow-[#8e44ad]/30 rounded-xl relative overflow-hidden ${className}`}>
        {/* Glow effect on the top border */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#8e44ad] to-transparent opacity-100"></div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthCard; 