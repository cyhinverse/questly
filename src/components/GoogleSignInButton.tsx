import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text?: string;
}

export function GoogleSignInButton({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  text = "Google"
}: GoogleSignInButtonProps) {
  return (
    <Button 
      type="button"
      variant="outline" 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className="w-full"
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google" 
        className="w-5 h-5" 
      />
      <span className="font-medium text-black">
        {isLoading ? "Signing in..." : text}
      </span>
    </Button>
  );
}
