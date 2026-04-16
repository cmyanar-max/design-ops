import React from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
    "relative group border text-foreground text-center rounded-full inline-flex items-center justify-center gap-2 transition-all duration-200",
    {
        variants: {
            variant: {
                default: "bg-blue-500/5 hover:bg-blue-500/0 border-[#26619c]/20",
                solid: "bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-foreground/50",
                ghost: "border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10",
                destructive: "bg-red-500/2 hover:bg-red-500/0 border-[#dc2626]/20",
                "destructive-solid": "bg-red-500/70 hover:bg-red-600/80 text-white border-transparent hover:border-foreground/50",
            },
            size: {
                default: "px-7 py-1.5 ",
                sm: "px-4 py-0.5 ",
                lg: "px-10 py-2.5 ",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { neon?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, neon = true, size, variant, children, ...props }, ref) => {
        const isDestructive = variant === 'destructive' || variant === 'destructive-solid'
        const gradientColor = isDestructive ? '#dc2626' : '#26619c'

        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            >
                <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent hidden", neon && "block")} style={neon ? { backgroundImage: `linear-gradient(to right, transparent, ${gradientColor}, transparent)` } : undefined} />
                {children}
                <span className={cn("absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent hidden", neon && "block")} style={neon ? { backgroundImage: `linear-gradient(to right, transparent, ${gradientColor}, transparent)` } : undefined} />
            </button>
        );
    }
)

Button.displayName = 'Button';

export { Button, Button as NeonButton, buttonVariants, buttonVariants as neonButtonVariants };
