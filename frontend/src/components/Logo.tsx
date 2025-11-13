interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string; // Optional: path to logo image file
}

export function Logo({ className = '', size = 'md', src }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // Use the logo image file
  const logoPath = src || '/logo.png';

  return (
    <img 
      src={logoPath} 
      alt="Fellow Logo" 
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
}

