import { UserButton as ClerkUserButton } from '@clerk/clerk-react';

export function UserButton() {
  return (
    <div className="absolute top-4 right-4 z-50">
      <ClerkUserButton 
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
            userButtonPopoverCard: "bg-sage border border-sage",
            userButtonPopoverActionButton: "text-charcoal hover:bg-ivory",
            userButtonPopoverActionButtonText: "text-charcoal",
            userButtonPopoverFooter: "hidden",
          }
        }}
      />
    </div>
  );
}

