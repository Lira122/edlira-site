import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  speed?: number;
  fade?: boolean;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = 'left',
  speed = 30,
  fade = true,
  className,
  ...props
}: MarqueeProps) {
  return (
    <div className={cn('w-full overflow-hidden', className)} {...props}>
      <div
        className="relative flex overflow-hidden"
        style={
          fade
            ? ({
                maskImage:
                  'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={cn(
            'flex w-max shrink-0',
            direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse',
            pauseOnHover && 'hover:[animation-play-state:paused]'
          )}
          style={{ ['--duration' as never]: `${speed}s` }}
        >
          {children}
          {children}
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
