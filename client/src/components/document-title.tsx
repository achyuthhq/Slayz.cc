import { useEffect } from "react";

type DocumentTitleProps = {
  title: string;
  suffix?: string;
};

/**
 * A component that sets the document title.
 * @param title The main title for the page
 * @param suffix An optional suffix to append after the title (defaults to "| Slayz")
 */
export function DocumentTitle({ title, suffix = "| Slayz" }: DocumentTitleProps) {
  useEffect(() => {
    // Set the document title when the component mounts
    const previousTitle = document.title;
    document.title = `${title} ${suffix}`;

    // Reset the title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);

  // This component doesn't render anything
  return null;
}