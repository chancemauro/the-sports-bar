import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/PostCard'
import PostComposer from '@/components/PostComposer'

export default async function PostThread({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 const select='id,body,image_url,created_at,parent_id,author:profiles!posts_author_id_fkey(display_name,username,avatar_url),post_likes(count),reposts(count),replies:posts!posts_parent_id_fkey(count)'
 const {data:p}=await supabase.from('posts').select(select).eq('id',id).single(); if(!p)notFound();
 const {data:replies}=await supabase.from('posts').select(select).eq('parent_id',id).order('created_at',{ascending:true});
 const norm=(x:any)=>({...x,like_count:x.post_likes?.[0]?.count||0,repost_count:x.reposts?.[0]?.count||0,reply_count:x.replies?.[0]?.count||0})
 return <main className="shell"><section className="feedLayout"><div className="sectionHead"><div><div className="eyebrow">Conversation</div><h2>Post thread</h2></div></div><PostCard post={norm(p)} currentUserId={user?.id}/><PostComposer currentUserId={user?.id} parentId={id}/><div className="sectionHead"><h2>Replies</h2></div>{(replies||[]).map((r:any)=><PostCard key={r.id} post={norm(r)} currentUserId={user?.id}/>)}</section></main>
}
