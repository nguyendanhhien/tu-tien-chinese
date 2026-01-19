// src/components/VoiceRecorder.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  targetText: string; // Câu tiếng Trung cần đọc
  onSuccess?: () => void; // Hàm chạy khi đọc đúng
}

export default function VoiceRecorder({ targetText, onSuccess }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(""); // Chữ người dùng đọc được
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'wrong'>('idle');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Khởi tạo trình nghe (Chỉ chạy trên trình duyệt Chrome/Edge/Cốc Cốc)
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Chỉ nghe 1 câu rồi dừng
        recognition.lang = 'zh-CN'; // Nghe tiếng Trung
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          checkResult(text); // So sánh ngay
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (status === 'listening') setStatus('idle');
        };

        recognitionRef.current = recognition;
      }
    }
  }, [targetText]);

  // Hàm so sánh giọng đọc với câu mẫu
  const checkResult = (input: string) => {
    // Xóa dấu câu để so sánh cho dễ (Ví dụ: "你好！" -> "你好")
    const cleanInput = input.replace(/[^\u4e00-\u9fa5]/g, "");
    const cleanTarget = targetText.replace(/[^\u4e00-\u9fa5]/g, "");

    if (cleanInput.includes(cleanTarget) || cleanTarget.includes(cleanInput)) {
      setStatus('success');
      if (onSuccess) onSuccess(); // Báo cho trang chủ biết là đã đúng
    } else {
      setStatus('wrong');
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setStatus('listening');
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      alert("Trình duyệt này không hỗ trợ tu luyện Truyền Âm! Hãy dùng Chrome hoặc Edge.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <h3 className="text-cyan-300 text-sm uppercase tracking-widest mb-4">
        Truyền Âm Nhập Mật
      </h3>

      {/* Nút Micro */}
      <button
        onClick={startRecording}
        disabled={isRecording || status === 'success'}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          status === 'success' ? 'bg-green-500 shadow-[0_0_30px_#22c55e]' :
          status === 'wrong' ? 'bg-red-500 animate-shake shadow-[0_0_30px_#ef4444]' :
          isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/10 hover:bg-white/20 border border-white/20'
        }`}
      >
        {isRecording ? <Loader2 className="w-8 h-8 animate-spin text-white" /> : 
         status === 'success' ? <CheckCircle2 className="w-10 h-10 text-white" /> :
         status === 'wrong' ? <XCircle className="w-10 h-10 text-white" /> :
         <Mic className="w-8 h-8 text-cyan-400" />}
        
        {/* Vòng hào quang khi đang thu âm */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
        )}
      </button>

      {/* Hiển thị kết quả người dùng đọc */}
      <div className="h-8 mt-4">
        {transcript && (
          <p className={`text-lg font-serif ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            "{transcript}"
          </p>
        )}
        {!transcript && isRecording && <p className="text-gray-400 text-sm animate-pulse">Đang lắng nghe...</p>}
      </div>
      
      {/* Thông báo trạng thái */}
      {status === 'success' && <p className="text-green-400 text-sm mt-1">✨ Đạo tâm vững vàng! ✨</p>}
      {status === 'wrong' && <p className="text-red-400 text-sm mt-1">Tâm chưa tịnh, hãy thử lại!</p>}
    </div>
  );
}