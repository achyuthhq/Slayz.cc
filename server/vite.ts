import express, { type Express } from "express";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the static files are in dist/public
  // We need to use the correct path whether we're running from source or from the bundled output
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),       // Normal production build
    path.resolve(process.cwd(), "public"),               // Possible fallback
    path.resolve(__dirname, "public"),                   // When running from bundled code
    path.resolve(__dirname, "..", "public"),             // Another possible location
    // Render-specific paths
    path.resolve("/opt/render/project/src/dist/public"), // Render's project path
    path.resolve("/opt/render/project/src/public")       // Alternative Render path
  ];
  
  // Find the first path that exists
  let distPath = null;
  for (const pathToCheck of possiblePaths) {
    console.log(`Checking for static files at: ${pathToCheck}`);
    if (fs.existsSync(pathToCheck)) {
      distPath = pathToCheck;
      console.log(`Found static files at: ${distPath}`);
      break;
    }
  }
  
  // If no valid path was found, throw an error
  if (!distPath) {
    console.error("Could not find static files in any of these locations:");
    possiblePaths.forEach(p => console.error(`- ${p}`));
    console.error("Current directory:", process.cwd());
    console.error("Directory contents:", fs.readdirSync(process.cwd()));
    
    throw new Error(
      `Could not find the build directory. Make sure to build the client first with 'npm run build'`
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
