import './globals.css'
import Nav from '@/components/Nav'
import { BRAND } from '@/lib/brand'

export const metadata = { title: `${BRAND.name} — Sports media and conversation`, description: BRAND.tagline }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><Nav />{children}</body></html> }
