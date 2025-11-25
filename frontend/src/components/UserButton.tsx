import { UserButton as ClerkUserButton } from '@clerk/clerk-react';

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps = {}) {
  const defaultClassName = "absolute top-4 right-4 z-50";
  return (
    <div className={className || defaultClassName}>
      <ClerkUserButton 
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
            userButtonPopoverCard: "bg-sage border border-sage",
            userButtonPopoverActionButton: "text-charcoal hover:bg-ivory",
            userButtonPopoverActionButtonText: "text-charcoal",
            userButtonPopoverFooter: "hidden",
            userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-ivory/20",
          }
        }}
      />
    </div>
  );
}

