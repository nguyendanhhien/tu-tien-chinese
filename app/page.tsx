"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; 
import SentenceBuilder from "@/components/SentenceBuilder";
import VoiceRecorder from "@/components/VoiceRecorder";
import CharacterWriter from "@/components/CharacterWriter";
import { ArrowLeft, ArrowRight, Volume2, PlayCircle, User, LogOut, Loader2 } from "lucide-react";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  
  // Dữ liệu bài học từ DB
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // --- 1. LẤY DỮ LIỆU ---
  // --- 1. LẤY DỮ LIỆU (ĐÃ NÂNG CẤP) ---
  useEffect(() => {
    const fetchBiKip = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // -- LOGIC MỚI: Kiểm tra xem trên thanh địa chỉ có ?id=... không --
        const params = new URLSearchParams(window.location.search);
        const lessonId = params.get("id");
        
        let query = supabase.from('lessons').select('*');

        if (lessonId) {
            // Nếu có ID -> Lấy đúng bài đó
            query = query.eq('id', lessonId);
        } else {
            // Nếu không -> Lấy bài mới nhất
            query = query.order('created_at', { ascending: false }).limit(1);
        }

        const { data: lessons, error } = await query;
        const lesson = lessons ? lessons[0] : null;

        if (!lesson) { setLoading(false); return; }
        // -------------------------------------------------------------

        const { data: dialogues } = await supabase
          .from('dialogues')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('order_index', { ascending: true });

        const formattedData = {
            title: lesson.title,
            original_title: lesson.description,
            dialogues: dialogues?.map((d) => ({
                id: d.id,
                role: d.role,
                hanzi: d.hanzi,
                pinyin: d.pinyin,
                meaning: d.meaning,
                audio: d.audio_url || "",
                avatar: d.role === 'A' ? 'bg-cyan-600' : 'bg-red-600'
            })) || []
        };

        setLessonData(formattedData);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBiKip();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const currentLine = lessonData?.dialogues[currentIndex];

  // --- AUDIO & LOGIC ---
  const handlePlayAudio = () => {
    try {
      if (currentLine?.audio && currentLine.audio.length > 5) {
        const audio = new Audio(currentLine.audio);
        audio.play().catch(() => speakWithAI());
      } else {
        speakWithAI();
      }
    } catch (error) { console.error(error); }
  };

  const speakWithAI = () => {
    if (!currentLine) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentLine.hanzi);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8;    
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
    if (chineseVoice) utterance.voice = chineseVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (hasStarted && currentLine) {
      const timer = setTimeout(() => handlePlayAudio(), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, hasStarted]);

  const nextLine = () => {
    if (lessonData && currentIndex < lessonData.dialogues.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const prevLine = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // --- LOADING ---
  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white flex-col gap-4">
            <Loader2 className="animate-spin text-yellow-500 w-12 h-12" />
            <p className="text-yellow-200 font-serif tracking-widest animate-pulse">Đang hấp thu linh khí...</p>
        </div>
    )
  }

  if (!lessonData) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <p className="text-red-400">Tàng Kinh Các trống! Hãy vào /admin nhập bài.</p>
        </div>
      )
  }

  const charactersToPractice = currentLine.hanzi.replace(/[^\u4e00-\u9fa5]/g, "").split("");

  // --- MÀN HÌNH CHỜ ---
  if (!hasStarted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center text-white relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black">
        
        {/* NÚT BẢN ĐỒ (Góc trái) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
        <a href="/map" className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition text-yellow-400 font-bold text-sm">
            🗺️ Bản Đồ Tu Tiên
        </a>
      </div>
      
        {/* CƯỠNG CHẾ VỊ TRÍ USER (Góc phải) */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
             {user ? (
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition cursor-pointer group">
                    <User size={18} className="text-green-400"/>
                    <span className="text-sm text-green-400 font-bold">{user.email?.split('@')[0]}</span>
                    <button onClick={handleLogout} className="ml-2 p-1 bg-red-500/20 rounded-full text-red-400 hover:text-red-200 hidden group-hover:block transition">
                        <LogOut size={12}/>
                    </button>
                </div>
            ) : (
                <a href="/login" className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 font-bold bg-white/5 px-4 py-2 rounded-full border border-yellow-500/30 hover:border-yellow-500 transition">
                    <User size={16}/> Đăng nhập
                </a>
            )}
        </div>

        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-[0_0_60px_rgba(255,215,0,0.15)]">
          <h1 className="text-4xl font-bold text-yellow-400 glow-text mb-4 uppercase tracking-widest">
            {lessonData.title}
          </h1>
          <p className="text-xl text-gray-300 italic mb-12 font-serif">"{lessonData.original_title}"</p>
          
          <button 
            onClick={() => {
                setHasStarted(true);
                const silentAudio = new Audio();
                silentAudio.play().catch(() => {});
            }}
            style={{ background: 'linear-gradient(to right, #ca8a04, #eab308)', color: 'black' }}
            className="group relative w-full py-4 font-bold text-xl rounded-full hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <PlayCircle size={28} className="text-black" />
            <span>BẮT ĐẦU TU LUYỆN</span>
          </button>
        </div>
      </main>
    );
  }

  // --- MÀN HÌNH HỌC CHÍNH ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center text-white relative">
      
      {/* CƯỠNG CHẾ VỊ TRÍ USER */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
            {user ? (
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-xs text-green-400 font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {user.email?.split('@')[0]}
                    </span>
                    <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 transition ml-2 border-l border-white/20 pl-2">
                        Thoát
                    </button>
                </div>
            ) : (
                <a href="/login" className="text-xs text-yellow-400 hover:text-yellow-300 underline bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30">
                    Lưu tiến độ?
                </a>
            )}
      </div>

      <div className="w-full text-center mb-8 max-w-2xl mt-10">
        <h1 className="text-2xl font-bold text-yellow-400 glow-text uppercase tracking-widest opacity-80 mb-6">
          {lessonData.title}
        </h1>
        <div className="w-full max-w-md h-1.5 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / lessonData.dialogues.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-mono">Chiêu thức: {currentIndex + 1} / {lessonData.dialogues.length}</p>
      </div>

      <div className="relative w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8">
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${currentLine.avatar} text-white shadow-lg`}>
                Nhân vật {currentLine.role}
            </div>
            <h2 className="text-6xl font-serif text-white mb-4 drop-shadow-2xl tracking-wide">{currentLine.hanzi}</h2>
            <p className="text-2xl text-yellow-200/90 font-light mb-2">{currentLine.pinyin}</p>
            <p className="text-lg text-gray-400 italic">"{currentLine.meaning}"</p>
            
            <div className="flex flex-col items-center gap-2 mt-6">
                <button onClick={handlePlayAudio} className="p-4 bg-white/5 rounded-full hover:bg-cyan-900/30 transition border border-white/10 hover:border-cyan-400">
                    <Volume2 className="w-8 h-8 text-cyan-400" />
                </button>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Thính Phong</p>
            </div>
        </div>

        <div className="border-t border-white/5 pt-4 pb-8">
            <VoiceRecorder key={`mic-${currentIndex}`} targetText={currentLine.hanzi} />
        </div>

        <div className="border-t border-white/10 pt-6 pb-4">
            <SentenceBuilder key={`sentence-${currentIndex}`} targetSentence={currentLine.hanzi} />
        </div>

        <div className="border-t border-white/10 pt-8">
            <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-6 opacity-70">Luyện Hóa Ký Tự</h3>
            <div className="flex flex-wrap justify-center gap-8">
                {charactersToPractice.map((char: string, index: number) => (
                    <CharacterWriter key={`${currentIndex}-${index}`} character={char} size={120} />
                ))}
            </div>
        </div>

        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
            <button onClick={prevLine} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition text-white">
                <ArrowLeft size={20} /> Chiêu trước
            </button>
            <button onClick={nextLine} disabled={currentIndex === lessonData.dialogues.length - 1} className="flex items-center gap-2 px-8 py-3 rounded-full bg-yellow-600 text-black font-bold hover:scale-105 disabled:opacity-50 transition shadow-lg">
                Chiêu tiếp theo <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </main>
  );
}