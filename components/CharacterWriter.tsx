// src/components/CharacterWriter.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface Props {
  character: string;
  size?: number;
}

export default function CharacterWriter({ character, size = 200 }: Props) {
  const writerRef = useRef<HanziWriter | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      // Xóa nội dung cũ nếu có (để tránh bị lặp chữ khi đổi bài)
      divRef.current.innerHTML = "";
      
      writerRef.current = HanziWriter.create(divRef.current, character, {
        width: size,
        height: size,
        padding: 5,
        strokeColor: '#FCD34D', // Màu vàng kim
        radicalColor: '#38bdf8', // Màu bộ thủ (xanh cyan)
        showOutline: true,
        outlineColor: '#333333', // Màu nét mờ
      });

      // Tự động múa nét 1 lần khi hiện ra (Demo)
      writerRef.current.animateCharacter();
    }
  }, [character, size]);

  const handleQuiz = () => {
    if (writerRef.current) {
      writerRef.current.quiz(); // Chế độ bắt người dùng tự tô
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Khung vẽ chữ */}
      <div 
        ref={divRef} 
        className="bg-white/5 border-2 border-yellow-500/30 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)] cursor-pointer hover:border-yellow-500 transition-colors"
      />
      
      {/* Nút bấm luyện tập */}
      <button 
        onClick={handleQuiz}
        className="px-6 py-2 bg-yellow-600/20 text-yellow-300 border border-yellow-500/50 rounded-full hover:bg-yellow-500 hover:text-black transition font-bold"
      >
        🖌️ Cầm Bút Luyện Ngay
      </button>
    </div>
  );
}