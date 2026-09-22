import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { createClient } from '@/lib/supabase/server'

export default async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="nav">
      <Link href="/" className="brand"><span className="brandMark">{BRAND.mark}</span><span>{BRAND.shortName}</span></Link>
      <nav className="navLinks">
        <Link href="/">Home</Link><Link href="/feed">The Bar</Link><Link href="/write">Write</Link>
        {user ? <><Link href="/settings">Profile</Link><Link href="/admin">Admin</Link><form action="/auth/signout" method="post"><button className="linkBtn">Sign out</button></form></> : <Link className="pill" href="/auth">Sign in</Link>}
      </nav>
    </header>
  )
}
