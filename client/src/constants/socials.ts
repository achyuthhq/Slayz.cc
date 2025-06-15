import { 
    FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaTiktok, FaSnapchat, FaYoutube, FaReddit, FaDiscord, FaSpotify, FaSteam, FaBitcoin 
} from "react-icons/fa";
import { 
    SiTelegram, SiPinterest, SiTwitch, SiGithub, SiDribbble, SiSoundcloud, SiNetflix, SiEthereum, SiBinance, SiEpicgames, SiPaypal 
} from "react-icons/si";
import { FaXbox } from "react-icons/fa";

export const SOCIAL_PLATFORMS = [
    // Social Media
    { name: "Facebook", icon: FaFacebook, code: "facebook" },
    { name: "Instagram", icon: FaInstagram, code: "instagram" },
    { name: "Twitter", icon: FaTwitter, code: "twitter" },
    { name: "LinkedIn", icon: FaLinkedin, code: "linkedin" },
    { name: "TikTok", icon: FaTiktok, code: "tiktok" },
    { name: "Snapchat", icon: FaSnapchat, code: "snapchat" },
    { name: "YouTube", icon: FaYoutube, code: "youtube" },
    { name: "Reddit", icon: FaReddit, code: "reddit" },
    { name: "Discord", icon: FaDiscord, code: "discord" },
    { name: "Telegram", icon: SiTelegram, code: "telegram" },
    { name: "Pinterest", icon: SiPinterest, code: "pinterest" },

    // Streaming & Music
    { name: "Spotify", icon: FaSpotify, code: "spotify" },
    { name: "SoundCloud", icon: SiSoundcloud, code: "soundcloud" },
    { name: "Netflix", icon: SiNetflix, code: "netflix" },

    // Gaming & Communities
    { name: "Twitch", icon: SiTwitch, code: "twitch" },
    { name: "Steam", icon: FaSteam, code: "steam" },
    { name: "Epic Games", icon: SiEpicgames, code: "epicgames" },
    { name: "Xbox", icon: FaXbox, code: "xbox" },

    // Crypto & Payments
    { name: "Bitcoin", icon: FaBitcoin, code: "bitcoin" },
    { name: "Ethereum", icon: SiEthereum, code: "ethereum" },
    { name: "Binance", icon: SiBinance, code: "binance" },
    { name: "PayPal", icon: SiPaypal, code: "paypal" },

    // Developer & Design
    { name: "GitHub", icon: SiGithub, code: "github" },
];
