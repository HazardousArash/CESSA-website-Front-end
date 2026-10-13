"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import mermaid from 'mermaid';
import { ArrowRight, Calendar, Heart, MessageSquare, Send, Trash2, X, Reply, ExternalLink, Bookmark, User } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes['*'] || []), 'className', 'style', 'dir', 'align']
  }
};

export default function PostDetailPage({ params }) {
  const routeParams = useParams();
  const id = routeParams?.id || (params && typeof params.then === "function" ? use(params)?.id : params?.id);
  const { isAuthenticated, role, user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [isLikedLocally, setIsLikedLocally] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const activeRole = role ? (role === "Admin" ? "admin" : role === "ContentCreator" ? "creator" : "student") : "student";

  const fetchPostAndComments = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        isAuthenticated ? cessaService.posts.getPostById(activeRole, id) : cessaService.public.getPostById(id),
        cessaService.posts.getComments(isAuthenticated ? activeRole : "student", id)
      ]);
      setPost(postRes?.data);
      setIsLikedLocally(postRes?.data?.isLikedByCurrentUser);
      setLocalLikeCount(postRes?.data?.likesCount);
      setComments(commentsRes?.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPostAndComments(); }, [id, isAuthenticated, activeRole]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    setTimeout(() => {
      try { mermaid.run({ querySelector: '.mermaid' }); } catch (e) {}
    }, 100);
  }, [post]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert("لطفا وارد حساب کاربری خود شوید.");
    setIsLikedLocally(!isLikedLocally); setLocalLikeCount(prev => isLikedLocally ? prev - 1 : prev + 1);
    try { await cessaService.posts.toggleLike(activeRole, id); } catch { setIsLikedLocally(!isLikedLocally); setLocalLikeCount(prev => isLikedLocally ? prev - 1 : prev + 1); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try { await cessaService.posts.addComment(activeRole, id, { text: commentText, parentCommentId: replyTo?.id }); setCommentText(""); setReplyTo(null); fetchPostAndComments(); } catch (err) {}
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("حذف شود؟")) return;
    try { await cessaService.posts.deleteComment(activeRole, id, commentId); fetchPostAndComments(); } catch {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyber-teal font-mono">// LOADING_POST_DATA...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-white text-lg font-bold">پست مورد نظر یافت نشد.</div>;

  const CommentItem = ({ c, isReply = false }) => (
    <div className={`p-6 rounded-2xl border border-white/5 ${isReply ? 'bg-dark-950/60 mt-4 mr-6 sm:mr-12 border-r-2 border-r-cyber-teal/40' : 'bg-dark-900/60'}`}>
      <div className="flex gap-4">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-dark-800 border border-cyber-teal/30 flex items-center justify-center text-cyber-teal font-bold text-lg overflow-hidden">
          {c.profilePictureUrl ? <img src={getImageUrl(c.profilePictureUrl)} className="w-full h-full object-cover" /> : c.userName[0]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2"><span className="font-bold text-white">{c.userName}</span><span className="text-xs text-gray-400 font-sans">{new Date(c.createdAt).toLocaleDateString("fa-IR")}</span></div>
          <p className="text-base text-gray-200 leading-8 mb-4 post-content" dir="auto">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}>
              {c.text ? c.text.replace(/\n{3,}/g, '\n\n') : ''}
            </ReactMarkdown>
          </p>
          <div className="flex items-center gap-5 text-sm">
            {isAuthenticated && !isReply && (
              <button onClick={() => setReplyTo({id: c.id, userName: c.userName})} className="text-gray-400 hover:text-cyber-teal flex items-center gap-1.5 cursor-pointer font-medium"><Reply size={16}/> پاسخ</button>
            )}
            {(role === "Admin" || c.userId === user?.id || (role === "ContentCreator" && post.authorId === user?.id)) && (
              <button onClick={() => handleDeleteComment(c.id)} className="text-gray-400 hover:text-red-400 flex items-center gap-1.5 cursor-pointer font-medium"><Trash2 size={16}/> حذف</button>
            )}
          </div>
        </div>
      </div>
      {c.replies?.map(r => <CommentItem key={r.id} c={r} isReply={true} />)}
    </div>
  );

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        <Link href="/posts" className="inline-flex items-center space-x-2 space-x-reverse text-cyber-teal hover:underline text-base sm:text-lg font-medium mb-8"><ArrowRight size={20} /><span>بازگشت به مطالب</span></Link>
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-cyber-teal/30 mb-10">
          <div className="w-full h-72 sm:h-[450px] rounded-3xl overflow-hidden border border-cyber-teal/30 shadow-[0_0_30px_rgba(45,212,191,0.2)] mb-8"><img src={getImageUrl(post.coverFilePath)} className="w-full h-full object-cover" /></div>
          {post.categoryName && (<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20 text-xs font-bold mb-4"><Bookmark size={14} /> {post.categoryName}</div>)}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-8 leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-dark-900 border border-cyber-teal/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {post.authorProfilePictureUrl ? <img src={getImageUrl(post.authorProfilePictureUrl)} alt={post.authorName} className="w-full h-full object-cover" /> : <User size={24} className="text-cyber-teal" />}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">{post.authorName}</span>
              <span className="text-xs text-gray-400 font-sans flex items-center gap-1.5"><Calendar size={14}/> {new Date(post.createdAt).toLocaleDateString("fa-IR")}</span>
            </div>
          </div>

          <div className="text-gray-200 text-base sm:text-lg md:text-xl mb-10 post-content" dir="auto">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match && match[1] === 'mermaid') {
                    return <div className="mermaid">{String(children).replace(/\n$/, '')}</div>;
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {post.content ? post.content.replace(/\n{3,}/g, '\n\n') : ''}
            </ReactMarkdown>
          </div>
          
          {(post.link1 || post.link2 || post.link3) && (
             <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-10">
                {post.link1 && <a href={post.link1} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-cyber-teal text-sm font-bold flex items-center justify-center gap-2 hover:bg-dark-800 transition-colors"><ExternalLink size={16}/> پیوست ۱</a>}
                {post.link2 && <a href={post.link2} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-cyber-teal text-sm font-bold flex items-center justify-center gap-2 hover:bg-dark-800 transition-colors"><ExternalLink size={16}/> پیوست ۲</a>}
                {post.link3 && <a href={post.link3} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-cyber-teal text-sm font-bold flex items-center justify-center gap-2 hover:bg-dark-800 transition-colors"><ExternalLink size={16}/> پیوست ۳</a>}
             </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10 gap-4">
            <button onClick={handleLike} className="flex items-center gap-2.5 text-gray-300 hover:text-red-400 cursor-pointer group text-base sm:text-lg font-bold"><Heart size={26} className={`${isLikedLocally ? "fill-red-500 text-red-500 animate-heart-pulse" : "group-hover:fill-red-400/20"}`} /><span className="pt-0.5">{localLikeCount}</span></button>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-white/10" id="comments">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><MessageSquare className="text-cyber-teal" size={26} /><span>نظرات کاربران</span></h3>
          {isAuthenticated ? (
            <div className="mb-10 relative">
              {replyTo && (<div className="flex justify-between bg-dark-800 p-3 rounded-t-2xl text-sm text-gray-200 border border-b-0 border-white/10"><span>در حال پاسخ به: <span className="font-bold text-cyber-teal">{replyTo.userName}</span></span><button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300"><X size={18}/></button></div>)}
              <form onSubmit={handleAddComment} className="relative"><textarea rows="4" required value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="نظر خود را بنویسید..." className={`w-full bg-dark-900 text-white p-5 border border-white/10 focus:border-cyber-teal outline-none text-base sm:text-lg resize-none placeholder:text-gray-500 ${replyTo ? 'rounded-b-2xl' : 'rounded-2xl'}`} /><button type="submit" className="absolute left-4 bottom-5 px-4 py-2 bg-cyber-teal text-dark-950 rounded-xl cursor-pointer hover:bg-teal-300 transition-all font-bold flex items-center gap-1.5 text-sm sm:text-base"><span>ارسال</span><Send size={18} className="rotate-180" /></button></form>
            </div>
          ) : (<div className="mb-10 p-5 bg-dark-900 rounded-2xl border border-white/5 text-base text-gray-300 text-center">برای ثبت نظر <Link href="/login" className="text-cyber-teal underline font-bold">وارد حساب</Link> شوید.</div>)}
          <div className="space-y-4">{comments.length > 0 ? comments.map(c => <CommentItem key={c.id} c={c} />) : <div className="text-center text-gray-400 py-6">نظری ثبت نشده است.</div>}</div>
        </div>
      </div>
    </div>
  );
}
