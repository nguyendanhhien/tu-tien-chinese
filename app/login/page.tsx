// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  // Hàm Đăng Ký (Ghi danh đệ tử mới)
  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage("Lỗi: " + error.message);
    else setMessage("Ghi danh thành công! Hãy bấm Đăng Nhập.");
    setLoading(false);
  };

  // Hàm Đăng Nhập (Vào cổng)
  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("Sai mật khẩu hoặc email chưa đăng ký!");
      setLoading(false);
    } else {
      // Đăng nhập xong thì đá về trang chủ để học
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-black text-white">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2 uppercase tracking-widest glow-text">
          Nhập Môn
        </h1>
        <p className="text-center text-gray-400 mb-8 italic">"Khai báo danh tính để lưu giữ tu vi"</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-cyan-300 mb-1">Email (Truyền thư phù)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded p-3 focus:border-yellow-500 focus:outline-none transition text-white"
              placeholder="dao_huu@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm text-cyan-300 mb-1">Mật khẩu (Khẩu quyết)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded p-3 focus:border-yellow-500 focus:outline-none transition text-white"
              placeholder="••••••••"
            />
          </div>

          {message && <p className="text-red-400 text-center text-sm">{message}</p>}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 py-3 rounded border border-white/20 hover:bg-white/10 transition font-bold"
            >
              Ghi Danh
            </button>
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 py-3 rounded bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold hover:scale-105 transition shadow-lg flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18}/>}
              Vào Cổng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}