import React, { ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
}

/**
 * A wrapper component for motion elements that handles className and style props correctly.
 * This solves TypeScript errors related to motion components not accepting className directly.
 */
export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  className,
  wrapperClassName,
  ...motionProps
}) => {
  return (
    <div className={wrapperClassName}>
      <motion.div {...motionProps} style={{ display: "block", ...motionProps.style }}>
        <div className={className}>{children}</div>
      </motion.div>
    </div>
  );
};

/**
 * A wrapper for motion.img that handles TypeScript errors with image props.
 */
interface MotionImageProps extends MotionProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}

export const MotionImage: React.FC<MotionImageProps> = ({
  src,
  alt,
  className,
  wrapperClassName,
  ...motionProps
}) => {
  return (
    <div className={wrapperClassName}>
      <motion.div {...motionProps} style={{ display: "block", ...motionProps.style }}>
        <img src={src} alt={alt} className={className} />
      </motion.div>
    </div>
  );
};

export default MotionWrapper; 