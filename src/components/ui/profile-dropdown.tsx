import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Settings, LogOut, AlertCircle } from "lucide-react";

type ProfileDropdownProps = {
  onLogout: () => void;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onReportCard?: () => void;
  trigger: React.ReactNode; // 👈 any button or element can be passed in
};

export const ProfileDropdown = ({
  onLogout,
  onViewProfile,
  onEditProfile,
  onReportCard,
  trigger,
}: ProfileDropdownProps): JSX.Element => {
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger} {/* 👈 use whatever was passed */}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditProfile}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        {onReportCard && (
          <DropdownMenuItem onClick={onReportCard} className="text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Report Lost/Stolen Card</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
