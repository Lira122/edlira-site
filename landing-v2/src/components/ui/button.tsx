import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eleva/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary:
          'bg-eleva text-primary-foreground shadow-[0_0_0_1px_rgba(200,245,66,0.4),0_8px_32px_-8px_rgba(200,245,66,0.5)] hover:shadow-[0_0_0_1px_rgba(200,245,66,0.6),0_12px_40px_-8px_rgba(200,245,66,0.7)] hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'border border-white/15 bg-white/0 text-foreground backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.04]',
        ghost: 'text-foreground/80 hover:text-foreground hover:bg-white/[0.04]',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6',
        lg: 'h-14 px-8 text-base font-semibold tracking-tight',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
