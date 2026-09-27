"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"

export interface FormFieldProps extends React.ComponentProps<typeof Field> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  htmlFor?: string
}

export function FormField({
  label,
  description,
  error,
  required,
  htmlFor,
  children,
  className,
  ...props
}: FormFieldProps) {
  const generatedId = React.useId()
  const fieldId = htmlFor ?? generatedId
  const descriptionId = description ? `${fieldId}-desc` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  const childAriaDescribedBy =
    React.isValidElement(children) &&
    typeof (children.props as Record<string, unknown>)["aria-describedby"] ===
      "string"
      ? ((children.props as Record<string, unknown>)[
          "aria-describedby"
        ] as string)
      : undefined

  return (
    <Field
      data-invalid={!!error}
      className={cn("w-full space-y-1.5", className)}
      {...props}
    >
      {label && (
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
            {required && (
              <span className="text-destructive font-semibold" aria-hidden="true">
                *
              </span>
            )}
          </FieldLabel>
        </div>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id: fieldId,
              "aria-describedby": cn(
                descriptionId,
                errorId,
                childAriaDescribedBy
              ),
              "aria-invalid": !!error || undefined,
              "aria-required": required || undefined,
            }
          )
        : children}

      {description && !error && (
        <FieldDescription id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </FieldDescription>
      )}

      {error && (
        <FieldError id={errorId} className="text-xs text-destructive font-medium">
          {error}
        </FieldError>
      )}
    </Field>
  )
}
