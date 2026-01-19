import './globals.css'

export const metadata = {
  title: 'Dynamic Pricing Intelligence Engine',
  description: 'Real-time AI-powered pricing optimization dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  )
}

