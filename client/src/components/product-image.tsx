import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showFallbackIcon?: boolean;
  className?: string;
}

export function ProductImage({ 
  src, 
  alt, 
  fallbackSrc, 
  showFallbackIcon = true, 
  className, 
  ...props 
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Default fallback image - you can host your own placeholder or use a data URI
  const defaultFallback = fallbackSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTQwSDI0MFYyNjBIMTYwVjE0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE4MCAyMDBMMjAwIDE4MEwyMjAgMjAwTDIwMCAyMjBMMTgwIDIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';

  if (hasError) {
    if (showFallbackIcon) {
      return (
        <div className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}>
          <ImageIcon className="h-8 w-8" />
        </div>
      );
    } else {
      return (
        <img
          src={defaultFallback}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }
  }

  return (
    <>
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted animate-pulse",
          className
        )}>
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}

// Hook for managing image loading state
export function useImageLoader(src: string) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  React.useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    const img = new Image();
    
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return status;
}