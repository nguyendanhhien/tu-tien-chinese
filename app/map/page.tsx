// src/app/map/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, BookOpen, Star } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLessons = async () => {
      // Lấy danh sách bài học
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .order('id', { ascending: true });
      
      if (data) setLessons(data);
      setLoading(false);
    };
    fetchLessons();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center mb-12 relative">
        <Link href="/" className="absolute left-0 p-3 bg-white/10 rounded-full hover:bg-white/20 transition text-white">
            <ArrowLeft />
        </Link>
        <h1 className="w-full text-center text-3xl font-bold text-yellow-400 uppercase glow-text">
            Bản Đồ Tu Tiên
        </h1>
      </div>

      {/* Danh sách bài học */}
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            <div className="col-span-3 text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-gray-400">Đang dò tìm địa hình...</p>
            </div>
        ) : lessons.length === 0 ? (
            <p className="text-center text-gray-500 col-span-3">Chưa có bài nào trong Tàng Kinh Các.</p>
        ) : (
            lessons.map((lesson) => (
              <Link 
                key={lesson.id} 
                href={`/?id=${lesson.id}`} 
                // --- CƯỠNG CHẾ STYLE Ở ĐÂY ---
                style={{ 
                    textDecoration: 'none', 
                    color: 'white', 
                    display: 'block',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                }}
                className="group relative border border-gray-700 rounded-2xl p-6 hover:border-yellow-500 transition-all hover:-translate-y-2"
              >
                {/* Hiệu ứng hào quang khi hover */}
                <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 rounded-2xl transition duration-500"></div>

                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-yellow-500 group-hover:text-black transition text-white">
                        <BookOpen size={24} />
                    </div>
                    <div className="flex gap-1">
                        {[...Array(lesson.level)].map((_, i) => (
                            <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                        ))}
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition" style={{ color: 'white' }}>
                    {lesson.title}
                </h3>
                <p className="text-sm text-gray-400 italic">
                    "{lesson.description}"
                </p>

                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500 uppercase tracking-widest group-hover:text-yellow-500 transition">
                    <span>HSK {lesson.level}</span>
                    <span className="group-hover:translate-x-1 transition">Vào học &rarr;</span>
                </div>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}