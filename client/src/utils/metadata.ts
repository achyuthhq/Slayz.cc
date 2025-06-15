import { Metadata } from "next";

interface MetadataProps {
    title?: string;
    description?: string;
    icons?: Metadata["icons"];
    noIndex?: boolean;
    keywords?: string[];
    author?: string;
    twitterHandle?: string;
    type?: "website" | "article" | "profile";
    locale?: string;
    alternates?: Record<string, string>;
    publishedTime?: string;
    modifiedTime?: string;
}

export const generateMetadata = ({
    title = `Slayz | Home"`,
    description = `Slayz is a next-gen bio link platform that redefines how you showcase your online presence. Customize with stunning animations, AI-powered interactions, music, badges, and more—all in one seamless experience. Stand out and express yourself like never before.`,
    icons = [
        {
            rel: "icon",
            url: "/icons/icon-dark.png",
            media: "(prefers-color-scheme: light)",
        },
        {
            rel: "icon",
            url: "/icons/icon.png",
            media: "(prefers-color-scheme: dark)",
        },
    ],
    noIndex = false,
    keywords = [
        "AI marketing automation",
        "social media marketing",
        "content generation",
        "marketing analytics",
        "campaign management",
        "multilingual marketing",
        "AI copywriting",
        "marketing workflow",
        "performance tracking",
        "digital marketing tools"
    ],
    author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
    type = "website",
}: MetadataProps = {}): Metadata => {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vertra-ai.vercel.app");

    return {
        metadataBase,
        title: {
            template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
            default: title
        },
        description,
        keywords,
        authors: [{ name: author }],
        creator: author,
        publisher: process.env.NEXT_PUBLIC_APP_NAME,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        icons,
    };
};