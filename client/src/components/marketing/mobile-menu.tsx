import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/constants";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ShinyButton } from "../ui/shiny-button";

const MobileMenu = React.memo(() => {
  const { user } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[300px] pt-12">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="text-base font-medium transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-border">
            {user ? (
              <ShinyButton 
                variant="outline" 
                className="bg-transparent border-white/20 hover:bg-white/5" 
                href="/dashboard/overview"
              >
                Dashboard
              </ShinyButton>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/auth" className="hover:text-white/80 text-center">
                  Login
                </Link>
                <ShinyButton 
                variant="outline" 
                className="bg-transparent border-white/20 hover:bg-white/5" 
                href="/auth"
              >
                Sign Up
              </ShinyButton>
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
});

export default MobileMenu;