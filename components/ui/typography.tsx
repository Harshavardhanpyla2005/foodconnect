import * as React from "react"
import { cn } from "cn"

export function DisplayHeading({
  className,
  children,
  as: Component = "h1",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "div"
}) {
  return (
    <Component
      className={cn(
        "font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function PageHeading({
  className,
  children,
  as: Component = "h1",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "div"
}) {
  return (
    <Component
      className={cn(
        "font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function SectionHeading({
  className,
  children,
  as: Component = "h2",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h2" | "h3" | "h4" | "div"
}) {
  return (
    <Component
      className={cn(
        "font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function Subheading({
  className,
  children,
  as: Component = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h3" | "h4" | "h5" | "div"
}) {
  return (
    <Component
      className={cn(
        "font-heading text-lg font-semibold tracking-tight text-foreground leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function BodyText({
  className,
  children,
  size = "default",
  as: Component = "p",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  size?: "sm" | "default" | "lg"
  as?: "p" | "span" | "div"
}) {
  return (
    <Component
      className={cn(
        "leading-relaxed text-foreground/90 font-normal",
        size === "sm" && "text-sm",
        size === "default" && "text-base",
        size === "lg" && "text-lg",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function MutedText({
  className,
  children,
  as: Component = "p",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div"
}) {
  return (
    <Component
      className={cn("text-sm text-muted-foreground leading-normal", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function LabelText({
  className,
  children,
  as: Component = "span",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  as?: "span" | "label" | "div"
}) {
  return (
    <Component
      className={cn(
        "text-xs font-semibold tracking-wider uppercase text-muted-foreground select-none",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function MetadataText({
  className,
  children,
  as: Component = "span",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  as?: "span" | "div"
}) {
  return (
    <Component
      className={cn(
        "text-xs text-muted-foreground font-medium inline-flex items-center gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function StatNumber({
  className,
  children,
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "span" | "p"
}) {
  return (
    <Component
      className={cn(
        "font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground tabular-nums leading-none",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export const MetricValue = StatNumber

export function EditorialLead({
  className,
  children,
  as: Component = "p",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "div"
}) {
  return (
    <Component
      className={cn(
        "text-lg sm:text-xl text-foreground/85 leading-relaxed font-normal text-pretty max-w-3xl",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function EditorialQuote({
  quote,
  attribution,
  role,
  className,
}: {
  quote: string
  attribution: string
  role?: string
  className?: string
}) {
  return (
    <figure className={cn("border-l-2 border-primary/60 pl-4 py-1 space-y-1.5 my-4", className)}>
      <blockquote className="text-base sm:text-lg italic text-foreground/90 font-serif leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        <span className="font-semibold text-foreground">{attribution}</span>
        {role && (
          <>
            <span>•</span>
            <span>{role}</span>
          </>
        )}
      </figcaption>
    </figure>
  )
}


