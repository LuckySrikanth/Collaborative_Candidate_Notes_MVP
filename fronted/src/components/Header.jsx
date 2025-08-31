import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center p-4 border-b bg-white">
      {/* Heading */}
      <h1 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">
        Collaborative Notes
      </h1>

      {/* Navigation */}
      <nav className="flex justify-end w-full sm:w-auto">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                      user?.username || "Guest"
                    }`}
                    alt={user?.username || "Guest"}
                  />
                  <AvatarFallback>
                    {user?.username
                      ? user.username.substring(0, 2).toUpperCase()
                      : "NA"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email || "N/A"}
                </p>
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto"
          >
            Login
          </Button>
        )}
      </nav>
    </header>
  );
};

export default Header;
