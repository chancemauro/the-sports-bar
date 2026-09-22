import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'
import { createClient } from '@/lib/supabase/server'

export default async function Feed(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
 const {data:posts}=await supabase.from('posts').select('id,body,image_url,created_at,parent_id,author:profiles!posts_author_id_fkey(display_name,username,avatar_url),post_likes(count),reposts(count),replies:posts!posts_parent_id_fkey(count)').is('parent_id',null).order('created_at',{ascending:false}).limit(50)
 const normalized=(posts||[]).map((p:any)=>({...p,like_count:p.post_likes?.[0]?.count||0,repost_count:p.reposts?.[0]?.count||0,reply_count:p.replies?.[0]?.count||0}))
 return <main className="shell"><section className="feedLayout"><div className="sectionHead"><div><div className="eyebrow">Live conversation</div><h2>The Bar</h2></div></div><PostComposer currentUserId={user?.id}/>{normalized.map((p:any)=><PostCard key={p.id} post={p} currentUserId={user?.id}/>)}</section></main>
}
