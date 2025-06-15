export const users = createTable(
  "users",
  {
    spotifyLink: text(),
    spotifyCustomText: text().default("Favourite Song"),
  },
); 