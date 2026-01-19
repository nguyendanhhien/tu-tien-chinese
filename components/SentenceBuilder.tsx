// src/components/SentenceBuilder.tsx
"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Check, X } from "lucide-react";

interface Props {
  targetSentence: string; // Câu mẫu (Ví dụ: "你好")
}

export default function SentenceBuilder({ targetSentence }: Props) {
  // Tách câu thành các mảnh (Linh thạch) và xáo trộn
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'wrong'>('idle');

  useEffect(() => {
    resetPuzzle();
  }, [targetSentence]);

  const resetPuzzle = () => {
    // 1. Tách câu thành từng chữ cái (Bỏ dấu câu để đỡ khó)
    // Chỉ lấy chữ Hán
    const cleanSentence = targetSentence.replace(/[^\u4e00-\u9fa5]/g, "");
    const parts = cleanSentence.split(""); 
    
    // 2. Xáo trộn (Shuffle)
    const shuffled = [...parts].sort(() => Math.random() - 0.5);
    
    setScrambledWords(shuffled);
    setSelectedWords([]);
    setStatus('idle');
  };

  // Khi chọn 1 từ từ kho
  const handleSelectWord = (word: string, index: number) => {
    if (status === 'success') return;

    // Thêm vào danh sách đã chọn
    setSelectedWords([...selectedWords, word]);
    
    // Xóa khỏi danh sách chờ (ẩn đi)
    const newScrambled = [...scrambledWords];
    newScrambled.splice(index, 1); // Xóa từ tại vị trí đó
    setScrambledWords(newScrambled);
  };

  // Khi bấm vào từ đã chọn (để trả lại kho)
  const handleDeselectWord = (word: string, index: number) => {
    if (status === 'success') return;

    // Xóa khỏi danh sách đã chọn
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);

    // Trả về kho
    setScrambledWords([...scrambledWords, word]);
    setStatus('idle');
  };

  // Kiểm tra kết quả
  const checkResult = () => {
    const cleanTarget = targetSentence.replace(/[^\u4e00-\u9fa5]/g, "");
    const userSentence = selectedWords.join("");

    if (userSentence === cleanTarget) {
      setStatus('success');
    } else {
      setStatus('wrong');
      // Rung lắc nhẹ (sẽ thêm class animate-shake sau)
      setTimeout(() => setStatus('idle'), 1000); 
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 w-full">
      <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-4">
        Trận Pháp Ngữ Pháp
      </h3>

      {/* 1. Khu vực hiển thị kết quả (Các ô trống) */}
      <div className="flex flex-wrap justify-center gap-2 min-h-[60px] w-full max-w-lg bg-white/5 border-2 border-dashed border-gray-600 rounded-xl p-4 mb-6 transition-colors duration-300"
           style={{ borderColor: status === 'success' ? '#22c55e' : status === 'wrong' ? '#ef4444' : '#4b5563' }}
      >
        {selectedWords.length === 0 && (
          <span className="text-gray-500 text-sm self-center">Bấm vào các từ bên dưới để ghép câu...</span>
        )}

        {selectedWords.map((word, idx) => (
          <button
            key={`selected-${idx}`}
            onClick={() => handleDeselectWord(word, idx)}
            className="px-4 py-2 bg-yellow-600 text-black font-bold text-xl rounded-lg hover:bg-yellow-500 transition animate-pop-in"
          >
            {word}
          </button>
        ))}
      </div>

      {/* 2. Kho từ vựng (Các viên đá lơ lửng) */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {scrambledWords.map((word, idx) => (
          <button
            key={`scrambled-${idx}`}
            onClick={() => handleSelectWord(word, idx)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 text-white font-serif text-xl rounded-lg hover:border-cyan-400 hover:text-cyan-300 transition hover:-translate-y-1"
          >
            {word}
          </button>
        ))}
      </div>

      {/* 3. Nút kiểm tra */}
      <div className="flex gap-4">
        <button
            onClick={resetPuzzle}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition"
            title="Làm lại"
        >
            <RefreshCcw size={20} />
        </button>

        <button
            onClick={checkResult}
            disabled={selectedWords.length === 0 || status === 'success'}
            className={`px-8 py-2 rounded-full font-bold transition flex items-center gap-2 ${
                status === 'success' ? 'bg-green-500 text-white' : 
                'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-105'
            }`}
        >
            {status === 'success' ? <><Check /> Trận Pháp Hoàn Tất</> : "Khai Mở"}
        </button>
      </div>
    </div>
  );
}