import { format } from "date-fns";

export const formatLastOnline = (timestamp: number | null): string => {
  if (!timestamp) return "Never";
  return format(new Date(timestamp * 1000), "MMM d, yyyy 'at' h:mm a");
};
