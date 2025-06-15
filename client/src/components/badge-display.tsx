import { cn } from "@/lib/utils";
import {
  Star,
  Award,
  Shield,
  Zap,
  Crown,
  Target,
  Medal,
  Trophy,
  Heart,
  Check,
  User,
  ShoppingCart,
  Unlock,
  Image,
  Bug,
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { 
  FaMedal, 
  FaStar, 
  FaShieldAlt, 
  FaCrown, 
  FaHeartbeat,
  FaHeart,
  FaCheckCircle, 
  FaUserAlt,
  FaShoppingCart,
  FaUnlock,
  FaTrophy,
  FaImage,
  FaBug,
  FaLaptopCode,
  FaWrench,
  FaCode,
  FaChartLine,
  FaHandshake,
  FaFlask,
  FaMobileAlt,
  FaPalette,
  FaBook
} from "react-icons/fa";
import { IoDiamond } from "react-icons/io5";
import { BiSolidZap, BiSolidStar } from "react-icons/bi";
import { useAuth } from "@/hooks/use-auth";

// Add type definition for the theme
interface UserTheme {
  badges?: string[];
  [key: string]: any;
}

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned?: boolean;
};

interface BadgeDisplayProps {
  badge: Badge;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
  earnedBadges?: string[];
  customColor?: string; // Add customColor prop
}

export const badges: Badge[] = [
  {
    id: "member",
    name: "Member",
    description: "Official member of our platform",
    icon: <FaMedal className="w-3.5 h-3.5 glow-icon" />,
    color: "blue",
  },
  {
    id: "verified",
    name: "Verified",
    description: "User has verified their identity",
    icon: <FaCheckCircle className="w-3.5 h-3.5 glow-icon" />,
    color: "green",
  },
  {
    id: "developer",
    name: "Developer", 
    description: "Official developer of Slayz.cc",
    icon: <FaLaptopCode className="w-3.5 h-3.5 glow-icon" />,
    color: "cyan",
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "One of the first to join our platform",
    icon: <FaStar className="w-3.5 h-3.5 glow-icon" />,
    color: "orange",
  },
  {
    id: "server-booster",
    name: "Server Booster",
    description: "Boosted our Discord server",
    icon: <BiSolidZap className="w-3.5 h-3.5 glow-icon" />,
    color: "purple",
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    description: "Helped identify and report bugs",
    icon: <FaBug className="w-3.5 h-3.5 glow-icon" />,
    color: "green",
  },
  {
    id: "premium",
    name: "Premium User",
    description: "Subscribed to our premium features",
    icon: <IoDiamond className="w-3.5 h-3.5 glow-icon" />,
    color: "yellow",
  },
  {
    id: "founder",
    name: "Founder",
    description: "Creator of the platform",
    icon: <FaCrown className="w-3.5 h-3.5 glow-icon" />,
    color: "red",
  },
  {
    id: "staff",
    name: "Staff",
    description: "Official team member",
    icon: <FaShieldAlt className="w-3.5 h-3.5 glow-icon" />,
    color: "indigo",
  },
  {
    id: "donor",
    name: "Donor",
    description: "Generous platform supporter",
    icon: <FaHeartbeat className="w-3.5 h-3.5 glow-icon" />,
    color: "rose",
  },
  {
    id: "og",
    name: "OG",
    description: "Original Day-One User",
    icon: <Award className="w-3.5 h-3.5 glow-icon" />,
    color: "amber",
  },
  {
    id: "vip",
    name: "VIP",
    description: "VIP user with special privileges",
    icon: <BiSolidStar className="w-3.5 h-3.5 glow-icon" />,
    color: "pink",
  },
  {
    id: "supporter",
    name: "Supporter",
    description: "Supported the platform in its early days",
    icon: <FaHeart className="w-3.5 h-3.5 glow-icon" />,
    color: "red",
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Helps moderate content on the platform",
    icon: <FaWrench className="w-3.5 h-3.5 glow-icon" />,
    color: "slate",
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Contributed to the development of Slayz.cc",
    icon: <FaCode className="w-3.5 h-3.5 glow-icon" />,
    color: "blue",
  },
  {
    id: "sponsor",
    name: "Sponsor",
    description: "Official sponsor of Slayz.cc",
    icon: <FaChartLine className="w-3.5 h-3.5 glow-icon" />,
    color: "emerald",
  },
  {
    id: "winner",
    name: "Winner",
    description: "Competition or event winner",
    icon: <FaTrophy className="w-3.5 h-3.5 glow-icon" />,
    color: "gold",
  },
  {
    id: "friend",
    name: "Friend",
    description: "Friend of the Slayz.cc team",
    icon: <FaHandshake className="w-3.5 h-3.5 glow-icon" />,
    color: "teal",
  },
  {
    id: "tester",
    name: "Tester",
    description: "Helped test new features before release",
    icon: <FaFlask className="w-3.5 h-3.5 glow-icon" />,
    color: "violet",
  },
  {
    id: "pro",
    name: "Pro User",
    description: "Professional user with advanced skills",
    icon: <FaMedal className="w-3.5 h-3.5 glow-icon" />,
    color: "yellow",
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "Social media influencer partnered with Slayz.cc",
    icon: <FaMobileAlt className="w-3.5 h-3.5 glow-icon" />,
    color: "pink",
  },
  {
    id: "designer",
    name: "Designer",
    description: "Contributed design work to Slayz.cc",
    icon: <FaPalette className="w-3.5 h-3.5 glow-icon" />,
    color: "fuchsia",
  },
  {
    id: "ambassador",
    name: "Ambassador",
    description: "Official ambassador for Slayz.cc",
    icon: <FaStar className="w-3.5 h-3.5 glow-icon" />,
    color: "amber",
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Helps guide and support new users",
    icon: <FaBook className="w-3.5 h-3.5 glow-icon" />,
    color: "indigo",
  }
];

export function BadgeDisplay({
  badge,
  showDescription = false,
  size = "md",
  earnedBadges,
  customColor // Add customColor parameter
}: BadgeDisplayProps) {
  const { user } = useAuth();
  const theme = user?.theme as UserTheme || {};
  const userBadges = theme.badges || [];
  const isEarned = earnedBadges
    ? earnedBadges.includes(badge.id)
    : Array.isArray(userBadges) && userBadges.includes(badge.id);

  const sizeClasses = {
    sm: "w-7 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  if (!isEarned) return null;

  // Get the badge color - either custom or default
  const badgeColor = customColor || badge.color;
  const iconColor = customColor || `var(--${badge.color}-500)`;

  return (
    <div className="relative group">
      <div className="flex items-center justify-center">
        <div
          className={`flex items-center justify-center ${sizeClasses[size]}`}
          style={{
            transform: "scale(1.4)",
            color: iconColor, // Apply the color to the icon
            filter: `drop-shadow(0 0 4px ${iconColor}80) 
                    drop-shadow(0 0 6px ${iconColor}40) 
                    drop-shadow(0 0 8px ${iconColor}20)` // Add glow effect with the custom color
          }}
        >
          {badge.icon}
        </div>
      </div>

      {/* Tooltip */}
      {showDescription && (
        <div
          className="absolute opacity-0 group-hover:opacity-100 bottom-full right-0 mb-2 
                      px-2 py-1 bg-black/90 text-xs rounded whitespace-nowrap 
                      transform transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50"
        >
          <div className="font-semibold">{badge.name}</div>
        </div>
      )}
    </div>
  );
}

// Add this CSS to your global styles or a CSS module
const styles = `
  .glow-icon {
    transition: color 0.3s ease, filter 0.3s ease;
  }

  .badges-container {
    display: flex;
    gap: 8px;
    width: 100%;
    max-width: 300px;
    padding: 8px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Inject the styles into the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Usage example
export function BadgesList({ earnedBadges, customColor }: { earnedBadges: string[], customColor?: string }) {
  // If no badges are provided, don't render anything
  if (!earnedBadges || earnedBadges.length === 0) {
    return null;
  }

  return (
    <div className="badges-container">
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          earnedBadges={earnedBadges}
          showDescription={true}
          customColor={customColor}
        />
      ))}
    </div>
  );
}