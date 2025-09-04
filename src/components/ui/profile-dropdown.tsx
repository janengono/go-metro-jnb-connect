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
  holderName: string,
  cellNumber : string,
  onLogout: () => void;
  onReportCard?: () => void;
  trigger: React.ReactNode; // 👈 any button or element can be passed in
};

export const ProfileDropdown = ({
  holderName,
  cellNumber,
  onLogout,
  onReportCard,
  trigger,
}: ProfileDropdownProps): JSX.Element => {
  const user = {
    name: holderName,
    phoneNumber: cellNumber,
    avatar: "",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name.toUpperCase()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.phoneNumber}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        
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
