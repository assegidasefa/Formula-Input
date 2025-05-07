import type React from "react"
import { Providers } from "@/components/providers"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Formula Input Demo",
  description: "A formula input component with tags and operations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
