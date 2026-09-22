import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: articles } = await supabase.from('articles').select('id,slug,title,summary,sport,cover_url,published_at,author:profiles(display_name,username)').eq('status','published').order('published_at',{ascending:false}).limit(6)
  return <main className="shell">
    <section className="hero"><div className="heroMain"><div className="eyebrow">Sports media built for fans</div><h1>{BRAND.name}</h1><p className="muted">{BRAND.tagline}</p><div><Link className="pill" href="/feed">Enter The Bar →</Link></div></div><aside className="heroSide"><div className="eyebrow">Trending now</div>{['NFL Week 3','College Football','Fantasy Football','MLB playoff race','NHL preseason'].map((x,i)=><div className="trend" key={x}><strong>{i+1}. {x}</strong></div>)}</aside></section>
    <div className="sectionHead"><h2>The Press Box</h2><Link href="/write" className="muted">Write for The Press Box →</Link></div>
    <section className="grid">{articles?.length ? articles.map((a:any)=><Link className="card" href={`/article/${a.slug}`} key={a.id}><div className="cardImage" style={a.cover_url?{backgroundImage:`url(${a.cover_url})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}/><div className="cardContent"><span className="tag">{a.sport || 'SPORTS'}</span><h3>{a.title}</h3><p className="muted">{a.summary}</p><small>{a.author?.display_name || 'Staff'}</small></div></Link>) : <div className="panel"><p>No published articles yet. Sign in as an approved writer and publish the first one.</p></div>}</section>
  </main>
}
