import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CENTxt - Where Every Cent Counts',
  description: 'Social network where every interaction has value',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
