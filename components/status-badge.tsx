import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        STARTING: "bg-yellow-100 text-yellow-800",
        ONLINE: "bg-green-100 text-green-800",
        STOPPED: "bg-gray-100 text-gray-800",
        ERROR: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      status: "STOPPED",
    },
  },
)

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusVariants> {
  status: "STARTING" | "ONLINE" | "STOPPED" | "ERROR"
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ status }), className)} {...props}>
      <span className={cn("mr-1 inline-block h-2 w-2 rounded-full", getStatusDotClass(status))} />
      {status}
    </span>
  )
}

function getStatusDotClass(status: "STARTING" | "ONLINE" | "STOPPED" | "ERROR") {
  switch (status) {
    case "STARTING":
      return "bg-yellow-400 animate-pulse"
    case "ONLINE":
      return "bg-green-400 animate-ping"
    case "STOPPED":
      return "bg-gray-400 animate-none"
    case "ERROR":
      return "bg-red-400 animate-bounce"
    default:
      return "bg-gray-400"
  }
}

