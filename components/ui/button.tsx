import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// 1. Define Common Props: variant, size, asChild
type CommonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean
};

// 2. Define Exclusive Prop Sets
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & CommonProps;
type AnchorProps = React.ComponentPropsWithoutRef<'a'> & CommonProps;

// 3. Create a Union Type: Use React.PropsWithChildren for a slight simplification
// The component can now accept either set of props
type ButtonOrAnchorProps = ButtonProps | AnchorProps;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonOrAnchorProps) {
    
  // Logic to determine the component type:
  const isLink = !asChild && 'href' in props;

  // Set the component: Slot if asChild, 'a' if it's a link, 'button' otherwise
  const Comp = asChild ? Slot : isLink ? 'a' : 'button';

  return (
    // We cast props to any here to suppress the TypeScript error.
    // This is a safe practice in this specific scenario because:
    // 1. When Comp is 'button', props will definitely contain button-specific props.
    // 2. When Comp is 'a', props will definitely contain anchor-specific props (including href).
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)} 
    />
  )
}

export { Button, buttonVariants }

//import * as React from 'react'
//import { Slot } from '@radix-ui/react-slot'
//import { cva, type VariantProps } from 'class-variance-authority'
//
//import { cn } from '@/lib/utils'
//
//const buttonVariants = cva(
//  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
//  {
//    variants: {
//      variant: {
//        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
//        destructive:
//          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
//        outline:
//          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
//        secondary:
//          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
//        ghost:
//          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
//        link: 'text-primary underline-offset-4 hover:underline',
//      },
//      size: {
//        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
//        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
//        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
//        icon: 'size-9',
//        'icon-sm': 'size-8',
//        'icon-lg': 'size-10',
//      },
//    },
//    defaultVariants: {
//      variant: 'default',
//      size: 'default',
//    },
//  },
//)
//
//function Button({
//  className,
//  variant,
//  size,
//  asChild = false,
//  ...props
//}: React.ComponentProps<'button'> &
//  VariantProps<typeof buttonVariants> & {
//    asChild?: boolean
//  }) {
//  const Comp = asChild ? Slot : 'button'
//
//  return (
//    <Comp
//      data-slot="button"
//      className={cn(buttonVariants({ variant, size, className }))}
//      {...props}
//    />
//  )
//}
//
//export { Button, buttonVariants }
