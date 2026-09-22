'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Settings(){
 const supabase=createClient(); const [profile,setProfile]=useState<any>(null); const [displayName,setDisplayName]=useState(''); const [bio,setBio]=useState(''); const [avatar,setAvatar]=useState<File|null>(null); const [message,setMessage]=useState('')
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser(); if(!user)return; const {data}=await supabase.from('profiles').select('*').eq('id',user.id).single(); setProfile(data); setDisplayName(data?.display_name||''); setBio(data?.bio||'')})()},[])
 async function save(e:React.FormEvent){e.preventDefault(); if(!profile)return; setMessage('Saving…'); let avatarUrl=profile.avatar_url
  if(avatar){const path=`${profile.id}/${crypto.randomUUID()}-${avatar.name}`; const {error}=await supabase.storage.from('avatars').upload(path,avatar); if(error)return setMessage(error.message); avatarUrl=supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}
  const {error}=await supabase.rpc('update_my_profile',{p_display_name:displayName,p_bio:bio,p_avatar_url:avatarUrl}); setMessage(error?error.message:'Profile updated.')
 }
 if(!profile)return <main className="shell"><div className="formCard"><p>Sign in to edit your profile.</p></div></main>
 return <main className="shell"><form className="formCard" onSubmit={save}><div className="eyebrow">Profile</div><h1>Edit your profile</h1><div className="profileTop"><div className="avatar">{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:profile.display_name?.[0]}</div><div><strong>@{profile.username}</strong><div className="muted">{profile.role} · {profile.approval_status}</div></div></div><div className="fieldGroup"><label>Display name</label><input className="field" value={displayName} onChange={e=>setDisplayName(e.target.value)}/></div><div className="fieldGroup"><label>Bio</label><textarea className="field" value={bio} onChange={e=>setBio(e.target.value)}/></div><div className="fieldGroup"><label>Profile picture</label><input className="field" type="file" accept="image/*" onChange={e=>setAvatar(e.target.files?.[0]||null)}/></div><button className="primary">Save profile</button>{message&&<p className="muted">{message}</p>}</form></main>
}
