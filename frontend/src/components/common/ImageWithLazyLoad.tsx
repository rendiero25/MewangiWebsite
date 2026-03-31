import { useState, useEffect, useRef } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ImageWithLazyLoadProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
}

export default function ImageWithLazyLoad({
  src,
  alt,
  className = 'w-full h-auto',
  placeholderClassName = 'h-44 w-full',
  onLoad,
}: ImageWithLazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imageSrc === null) {
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={`${!isLoaded ? placeholderClassName : ''} overflow-hidden`}>
      {!isLoaded && <LoadingSkeleton className={placeholderClassName} />}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
}
