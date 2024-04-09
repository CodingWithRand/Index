import { Inter } from 'next/font/google'
import '@/gss/index.css'
import { Global } from '@/glient/global'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Registration Landing Page',
  description: 'Authenticate user & Creating account here.',
}

export default function RegistrationPageRootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Global>
          {children}
        </Global>
      </body>
    </html>
  )
}