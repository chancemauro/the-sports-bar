'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PostComposer({currentUserId,parentId}:{currentUserId?:string,parentId?:string}){
 const [body,setBody]=useState(''); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const router=useRouter(); const params=useSearchParams(); const supabase=createClient()
 async function submit(){ if(!currentUserId) return alert('Sign in to post.'); if(!body.trim()&&!file)return; setBusy(true); let image_url:string|null=null
  if(file){ const path=`${currentUserId}/${crypto.randomUUID()}-${file.name}`; const {error}=await supabase.storage.from('post-media').upload(path,file); if(error){setBusy(false);return alert(error.message)} const {data}=supabase.storage.from('post-media').getPublicUrl(path); image_url=data.publicUrl }
  const {error}=await supabase.from('posts').insert({author_id:currentUserId,body:body.trim(),image_url,parent_id:parentId||params.get('reply')||null}); setBusy(false); if(error)return alert(error.message); setBody(''); setFile(null); router.refresh()
 }
 return <div className="composer"><textarea maxLength={500} placeholder={currentUserId?'What’s happening in sports?':'Sign in to join the conversation.'} value={body} onChange={e=>setBody(e.target.value)} disabled={!currentUserId}/><div className="composerFooter"><label className="muted">📷 <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} hidden/> {file?.name||'Add image'}</label><button className="primary" onClick={submit} disabled={busy||!currentUserId}>{busy?'Posting…':(parentId||params.get('reply'))?'Reply':'Post'}</button></div></div>
}
