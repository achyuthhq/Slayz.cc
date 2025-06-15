import { NAV_LINKS } from "@/constants";
import { Link } from "react-router-dom";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/hooks/use-auth"; // Adjust the import path based on your project structure
import { ShinyButton } from "../ui/shiny-button";
import { FaExclamation } from "react-icons/fa";


const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 w-full h-16 bg-background/80 backdrop-blur-sm z-50 border-b border-white/10 rounded-b-lg">
      <Wrapper className="h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
            <a href="/" className="flex items-center space-x-2 text-2xl font-mono font-bold tracking-tighter">
  <img src="https://huggingface.co/spaces/Achyuth4/lynk/resolve/main/slayz.png" alt="Slayz.cc Logo" className="h-[50px] w-[120px] object-contain" />
</a>

            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link, index) => (
                <li key={index} className="text-sm font-medium -1 link">
                  <Link to={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <ShinyButton
                variant="outline"
                className="bg-transparent border-white/20 hover:bg-white/5"
                href="/dashboard/overview"
              >
                Dashboard
              </ShinyButton>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hover:text-white/80 hidden md:inline"
                >
                  Login
                </Link>
                <ShinyButton 
                variant="outline" 
                className="bg-transparent border-white/20 hover:bg-white/5" 
                href="/auth"
              >
                Sign Up <FaExclamation className="h-1.5 w-1.5" />
              </ShinyButton>
              </>
            )}
            <MobileMenu />
          </div>
        </div>
      </Wrapper>
    </header>
  );
};

export default Navbar;