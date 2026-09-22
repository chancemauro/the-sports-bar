'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [username,setUsername]=useState(''); const [mode,setMode]=useState<'login'|'signup'>('login'); const [message,setMessage]=useState(''); const router=useRouter(); const supabase=createClient()
 async function submit(e:React.FormEvent){ e.preventDefault(); setMessage('')
  if(mode==='signup'){ const {error}=await supabase.auth.signUp({email,password,options:{data:{username}}}); if(error)return setMessage(error.message); setMessage('Account created. Check your email if confirmation is enabled. Your account starts as a regular user until an admin approves publishing access.') }
  else { const {error}=await supabase.auth.signInWithPassword({email,password}); if(error)return setMessage(error.message); router.push('/'); router.refresh() }
 }
 return <main className="shell"><form className="formCard" onSubmit={submit}><div className="eyebrow">Account</div><h1>{mode==='login'?'Sign in':'Create account'}</h1>{mode==='signup'&&<div className="fieldGroup"><label>Username</label><input className="field" value={username} onChange={e=>setUsername(e.target.value)} required/></div>}<div className="fieldGroup"><label>Email</label><input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="fieldGroup"><label>Password</label><input className="field" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/></div><button className="primary" type="submit">{mode==='login'?'Sign in':'Create account'}</button>{message&&<p className="muted">{message}</p>}<p><button type="button" className="linkBtn" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Need an account? Sign up':'Already have an account? Sign in'}</button></p></form></main>
}
