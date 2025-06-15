import { useRef, useState, ReactNode } from "react";
import "./tilted-card.css";

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: ReactNode;
  displayOverlayContent?: boolean;
}

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale(1)");
  const [tooltipStyle, setTooltipStyle] = useState({
    opacity: 0,
    transform: "translate(0px, 0px) rotate(0deg)",
  });

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    setTransform(`rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleOnHover})`);
    
    setTooltipStyle({
      opacity: 1,
      transform: `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) rotate(0deg)`,
    });
  }

  function handleMouseEnter() {
    // Initial hover state is handled by handleMouse
  }

  function handleMouseLeave() {
    setTransform("rotateX(0deg) rotateY(0deg) scale(1)");
    setTooltipStyle({
      opacity: 0,
      transform: "translate(0px, 0px) rotate(0deg)",
    });
  }

  return (
    <div
      ref={ref}
      className="tilted-card-figure"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <div
        className="tilted-card-inner"
        style={{
          width: imageWidth,
          height: imageHeight,
          transform,
          transition: "transform 0.3s ease",
        }}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="tilted-card-img"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
        />

        {displayOverlayContent && overlayContent && (
          <div className="tilted-card-overlay">
            {overlayContent}
          </div>
        )}
      </div>

      {showTooltip && (
        <div
          className="tilted-card-caption"
          style={{
            ...tooltipStyle,
            transition: "opacity 0.3s ease",
          }}
        >
          {captionText}
        </div>
      )}
    </div>
  );
} 