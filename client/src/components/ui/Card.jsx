// src/components/ui/Card.jsx
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  "rounded-lg border bg-white text-gray-950 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        outline: "border-gray-300",
        elevated: "border-gray-200 shadow-lg",
        flat: "border-gray-200 shadow-none"
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md"
    }
  }
);

const Card = forwardRef(({
  className,
  variant,
  padding,
  animate = false,
  hover = false,
  children,
  ...props
}, ref) => {
  const Component = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  const hoverProps = hover ? {
    whileHover: { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" },
    transition: { type: "spring", stiffness: 300 }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...motionProps}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
});

const CardHeader = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </div>
));

const CardTitle = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
));

const CardDescription = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  >
    {children}
  </p>
));

const CardContent = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  >
    {children}
  </div>
));

const CardFooter = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
