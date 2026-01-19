"use client";

import SentenceBuilder from "@/components/SentenceBuilder";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useState, useEffect, useRef } from "react";
import { lessonOneData } from "../data/lesson1";
import CharacterWriter from "@/components/CharacterWriter";
import { ArrowLeft, ArrowRight, Volume2, PlayCircle } from "lucide-react";

export default function Home() {
  // Trạng thái: Đã bấm nút "Bắt đầu" chưa? (Để fix lỗi NotAllowedError)
  const [hasStarted, setHasStarted] = useState(false);
  
  // Trạng thái: Đang học câu số mấy?
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentLine = lessonOneData.dialogues[currentIndex];

  // Hàm phát âm thanh an toàn (Bắt lỗi nếu trình duyệt chặn)
  const handlePlayAudio = () => {
    try {
      // 1. Nếu có file MP3 thật
      if (currentLine.audio && currentLine.audio.length > 5) {
        const audio = new Audio(currentLine.audio);
        audio.play().catch((err) => {
            console.warn("Lỗi phát audio file:", err);
            // Nếu lỗi file thì chuyển sang đọc AI
            speakWithAI(); 
        });
      } 
      // 2. Nếu không có file -> Dùng AI (TTS)
      else {
        speakWithAI();
      }
    } catch (error) {
      console.error("Lỗi âm thanh:", error);
    }
  };

  // Hàm đọc bằng AI (Tách riêng để dễ quản lý)
  const speakWithAI = () => {
    // Hủy các lệnh đọc cũ
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentLine.hanzi);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8;    
    utterance.pitch = 1;      
    
    // Fix lỗi giọng trên một số trình duyệt
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
    if (chineseVoice) utterance.voice = chineseVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Tự động đọc khi đổi câu (Chỉ chạy khi đã bấm Bắt đầu)
  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, hasStarted]);

  // Logic chuyển câu
  const nextLine = () => {
    if (currentIndex < lessonOneData.dialogues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevLine = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const charactersToPractice = currentLine.hanzi.replace(/[^\u4e00-\u9fa5]/g, "").split("");

  // --- MÀN HÌNH CHỜ (Fix lỗi NotAllowedError) ---
  if (!hasStarted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center text-white">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-[0_0_50px_rgba(255,215,0,0.2)]">
          <h1 className="text-4xl font-bold text-yellow-400 glow-text mb-4 uppercase">
            {lessonOneData.title}
          </h1>
          <p className="text-xl text-gray-300 italic mb-10">"{lessonOneData.original_title}"</p>
          
          <button 
            onClick={() => {
                setHasStarted(true); // Mở khóa tương tác
                // Hack nhỏ: Phát thử một âm thanh rỗng để trình duyệt cấp quyền AudioContext
                const silentAudio = new Audio();
                silentAudio.play().catch(() => {});
            }}
            className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold text-xl rounded-full hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3 mx-auto"
          >
            <PlayCircle size={28} />
            Bắt Đầu Tu Luyện
            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-lg opacity-30 group-hover:opacity-60 transition-opacity"></div>
          </button>
          
          <p className="mt-6 text-sm text-gray-400">
            *Bấm nút để mở khóa "Thính Phong" (Âm thanh)
          </p>
        </div>
      </main>
    );
  }

  // --- MÀN HÌNH HỌC CHÍNH ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center text-white">
      
      {/* Header */}
      <div className="w-full text-center mb-8">
        <h1 className="text-2xl font-bold text-yellow-400 glow-text uppercase tracking-widest opacity-80">
          {lessonOneData.title}
        </h1>
        <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto mt-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / lessonOneData.dialogues.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card Học */}
      <div className="relative w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mt-4">
        
        {/* Nội dung */}
        <div className="mb-10">
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${currentLine.avatar} text-white`}>
                Nhân vật {currentLine.role}
            </div>
            <h2 className="text-6xl font-serif text-white mb-4 drop-shadow-lg">{currentLine.hanzi}</h2>
            <p className="text-2xl text-yellow-200/90 font-light mb-2">{currentLine.pinyin}</p>
            <p className="text-lg text-gray-400 italic">"{currentLine.meaning}"</p>
            
            {/* Nút nghe */}
        <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handlePlayAudio}
              className="mt-4 p-4 bg-white/5 rounded-full hover:bg-white/20 transition group border border-white/10 hover:border-cyan-400"
              title="Nghe mẫu (Thính Phong)"
            >
                <Volume2 className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition" />
            </button>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Thính Phong</p>
        </div>
    </div>

    {/* --- KHU VỰC TRUYỀN ÂM (Mới thêm) --- */}
    <div className="border-t border-white/10 pt-4 pb-8">
        <VoiceRecorder 
            key={currentIndex} // Reset trạng thái khi đổi câu
            targetText={currentLine.hanzi} 
        />
    </div>

    {/* --- KHU VỰC THÔNG NÃO (Ghép câu) --- */}
        <div className="border-t border-white/10 pt-6 pb-4">
            <SentenceBuilder 
                key={`sentence-${currentIndex}`} 
                targetSentence={currentLine.hanzi}
            />
        </div>

        {/* Luyện Viết */}
        <div className="border-t border-white/10 pt-8">
            <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-6">Luyện Hóa Ký Tự</h3>
            <div className="flex flex-wrap justify-center gap-8">
                {charactersToPractice.map((char, index) => (
                    <CharacterWriter key={`${currentIndex}-${index}`} character={char} size={120} />
                ))}
            </div>
        </div>

        {/* Điều hướng */}
        <div className="flex justify-between mt-12">
            <button 
                onClick={prevLine}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
            >
                <ArrowLeft size={20} /> Chiêu trước
            </button>

            <button 
                onClick={nextLine}
                disabled={currentIndex === lessonOneData.dialogues.length - 1}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold hover:scale-105 disabled:opacity-50 disabled:scale-100 transition shadow-lg shadow-yellow-500/20"
            >
                Chiêu tiếp theo <ArrowRight size={20} />
            </button>
        </div>

      </div>
    </main>
  );
}