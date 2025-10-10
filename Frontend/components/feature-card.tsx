"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface FeatureCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
  description: string
  icon?: React.ReactNode
  iconImage?: string
  iconAlt?: string
}

export function FeatureCard({ title, description, icon, iconImage, iconAlt, className, ...props }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn("h-full", className)}
    >
      <Card className="flex h-full flex-col items-center justify-center p-6 text-center" {...props}>
        <CardHeader className="pb-4 flex flex-col items-center text-center">
          <div className="flex justify-center">
            {iconImage ? (
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center p-4">
                <Image
                  src={iconImage}
                  alt={iconAlt || title}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            ) : (
              icon
            )}
          </div>
          <CardTitle className="mt-4 text-xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <p className="text-muted-foreground text-center max-w-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
