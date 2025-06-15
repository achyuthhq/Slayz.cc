import { Theme } from "@shared/schema";

interface DecorationPreviewProps {
  decoration: Theme["decoration"];
  className?: string;
}

// Updated to use local files instead of GitHub repository
const DECORATION_BASE_URL = "/decorations";

export function DecorationPreview({
  decoration,
  className = "",
}: DecorationPreviewProps) {
  if (!decoration?.enabled || !decoration.name) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        transform: `scale(${decoration.animation.scale || 1.5})`, // Increased Scale for Larger Display
      }}
    >
      <img
        src={`${DECORATION_BASE_URL}/${decoration.name}`}
        alt="Profile Decoration"
        className="w-full h-full object-contain" // Makes Image Larger
        style={{
          clipPath: "none", // Removes Circular Cropping
        }}
      />
    </div>
  );
}
