'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PostCard({ post, currentUserId }: { post: any; currentUserId?: string }) {
  const [likes, setLikes] = useState(post.like_count ?? 0)
  const [reposts, setReposts] = useState(post.repost_count ?? 0)
  const [liked, setLiked] = useState(false)
  const [reposted, setReposted] = useState(false)
  const supabase = createClient()

  async function toggleLike() {
    if (!currentUserId) return alert('Sign in to like posts.')
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId)
      setLikes((n:number)=>Math.max(0,n-1)); setLiked(false)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
      setLikes((n:number)=>n+1); setLiked(true)
    }
  }

  async function toggleRepost() {
    if (!currentUserId) return alert('Sign in to repost.')
    if (reposted) {
      await supabase.from('reposts').delete().eq('post_id', post.id).eq('user_id', currentUserId)
      setReposts((n:number)=>Math.max(0,n-1)); setReposted(false)
    } else {
      await supabase.from('reposts').insert({ post_id: post.id, user_id: currentUserId })
      setReposts((n:number)=>n+1); setReposted(true)
    }
  }

  return <article className="postCard">
    <div className="avatar">{post.author?.avatar_url ? <img src={post.author.avatar_url} alt=""/> : (post.author?.display_name?.[0] || 'S')}</div>
    <div className="postBody">
      <div className="postMeta"><strong>{post.author?.display_name || 'Sports user'}</strong><span>@{post.author?.username || 'user'}</span><span>·</span><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
      <p>{post.body}</p>
      {post.image_url && <img className="postImage" src={post.image_url} alt="Post upload" />}
      <div className="postActions">
        <a href={`/post/${post.id}`}>💬 {post.reply_count ?? 0}</a>
        <button onClick={toggleRepost}>↻ {reposts}</button>
        <button onClick={toggleLike}>{liked ? '♥' : '♡'} {likes}</button>
      </div>
    </div>
  </article>
}
