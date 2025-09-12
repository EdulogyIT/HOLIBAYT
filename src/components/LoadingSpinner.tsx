import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-2 border-muted border-t-primary',
      sizeClasses[size],
      className
    )} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 p-4">
        {spinner}
        <p className="text-sm text-muted-foreground">
          {text}
        </p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;