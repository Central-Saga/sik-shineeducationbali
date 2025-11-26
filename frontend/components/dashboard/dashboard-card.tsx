"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  href?: string
  iconColor?: string
  className?: string
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  iconColor = "bg-primary",
  className,
}: DashboardCardProps) {
  const content = (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        href && "hover:border-primary/50",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                iconColor
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        {href && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Lihat detail →</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

