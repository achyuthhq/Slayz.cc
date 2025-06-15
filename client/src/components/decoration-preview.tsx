import { Theme } from "@shared/schema";

interface DecorationPreviewProps {
  decoration: Theme["decoration"];
  className?: string;
}

// Updated to use GitHub repository instead of local files
const DECORATION_BASE_URL = "https://raw.githubusercontent.com/achyuth0/decos-rn/refs/heads/main";

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
        transform: `scale(${decoration.animation.scale || 1.6})`, // Increased scale for more prominent decorations
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
