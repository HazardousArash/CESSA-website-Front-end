"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import Navbar from "@/_components/layout/Navbar";
import CyberBackground from "@/_components/cyber/CyberBackground";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cessaService.public.getPosts()
      .then(res => setPosts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <CyberBackground />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-12 border-b border-white/10 pb-6">
          مطالب و مقالات
        </h1>

        {loading ? (
          <div className="text-cyber-teal font-mono text-base animate-pulse text-center py-20">// LOADING_POSTS...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="glass-panel-interactive rounded-3xl overflow-hidden flex flex-col group">
                <div className="relative h-64 bg-dark-900 overflow-hidden">
                  <img loading="lazy" decoding="async" src={getImageUrl(post.coverFilePath)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-dark-950/80 px-3.5 py-1.5 rounded-full text-[10px] text-cyber-teal font-mono border border-cyber-teal/30 flex items-center gap-1.5">
                    POST {post.categoryName && <span className="text-white">| {post.categoryName}</span>}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xl sm:text-2xl mb-3 group-hover:text-cyber-teal transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/5 text-xs sm:text-sm text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <User size={16} className="text-cyber-teal" />
                      {post.authorName || "انجمن"}
                    </span>
                    <span>{new Date(post.createdAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
