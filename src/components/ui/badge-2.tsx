import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  dotClassName?: string;
  disabled?: boolean;
}

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/15 text-green-500 hover:bg-green-500/25',
      },
      appearance: {
        default: '',
        outline: 'border-current bg-transparent hover:bg-transparent',
      }
    },
    compoundVariants: [
      {
        variant: 'success',
        appearance: 'outline',
        className: 'border-green-500/30 text-green-500',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className: 'border-red-500/30 text-red-500',
      }
    ],
    defaultVariants: {
      variant: 'default',
      appearance: 'default',
    },
  }
);

export function Badge({ className, variant, appearance, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? 'span' : 'div';
  return (
    <Comp className={cn(badgeVariants({ variant, appearance }), className)} {...props} />
  );
}
