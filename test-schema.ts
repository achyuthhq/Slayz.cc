import { insertSocialLinkSchema } from "./shared/pg-schema";

// Test data without id and userId
const testData = {
  title: "Test Link",
  url: "https://example.com",
  icon: "twitter",
  order: 0
};

try {
  // Attempt to validate the data with the schema
  const validatedData = insertSocialLinkSchema.parse(testData);
  console.log("Validation succeeded:", validatedData);
  console.log("Schema is now correctly omitting id and userId");
} catch (error) {
  console.error("Validation failed:", error);
} 