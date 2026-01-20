// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Save, Trash2 } from "lucide-react";

export default function AdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Dữ liệu bài học (Lesson)
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  
  // Dữ liệu các câu thoại (Dialogues)
  const [lines, setLines] = useState([
    { role: "A", hanzi: "", pinyin: "", meaning: "" }
  ]);

  // Thêm một dòng thoại trống mới
  const addLine = () => {
    setLines([...lines, { role: lines.length % 2 === 0 ? "A" : "B", hanzi: "", pinyin: "", meaning: "" }]);
  };

  // Xóa một dòng
  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  // Cập nhật nội dung từng dòng
  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...lines];
    // @ts-ignore
    newLines[index][field] = value;
    setLines(newLines);
  };

  // --- HÀM LƯU VÀO SUPABASE (Quan trọng nhất) ---
  const handleSave = async () => {
    if (!lessonTitle) return setMessage("Thiếu tên bài học!");
    setLoading(true);
    setMessage("Đang lưu...");

    try {
      // 1. Lưu bài học trước (Insert Lesson)
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert([{ 
            title: lessonTitle, 
            description: lessonDesc,
            level: 1 
        }])
        .select()
        .single();

      if (lessonError) throw lessonError;

      // 2. Lấy ID bài học vừa tạo để gắn vào các câu thoại
      const lessonId = lessonData.id;

      // 3. Chuẩn bị dữ liệu thoại
      const dialogueData = lines.map((line, index) => ({
        lesson_id: lessonId,
        role: line.role,
        hanzi: line.hanzi,
        pinyin: line.pinyin,
        meaning: line.meaning,
        order_index: index
      }));

      // 4. Lưu tất cả câu thoại một lúc (Bulk Insert)
      const { error: dialogueError } = await supabase
        .from('dialogues')
        .insert(dialogueData);

      if (dialogueError) throw dialogueError;

      setMessage("✅ Đã lưu bí kíp thành công!");
      // Reset form
      setLessonTitle("");
      setLessonDesc("");
      setLines([{ role: "A", hanzi: "", pinyin: "", meaning: "" }]);

    } catch (error: any) {
      setMessage("❌ Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8 uppercase">Hệ Thống Soạn Thảo Bí Kíp</h1>

        {/* PHẦN 1: THÔNG TIN BÀI HỌC */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">1. Thông tin Đại Cương</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tên Bài (Ví dụ: Luyện Khí Tầng 2)</label>
              <input 
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 outline-none"
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mô tả (Ví dụ: Đi mua sắm)</label>
              <input 
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 outline-none"
                value={lessonDesc}
                onChange={e => setLessonDesc(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* PHẦN 2: NỘI DUNG HỘI THOẠI */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyan-400">2. Nội dung Khẩu Quyết</h2>
            <button onClick={addLine} className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded hover:bg-green-500 transition">
              <Plus size={16}/> Thêm dòng
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-gray-900/50 p-4 rounded border border-gray-700">
                <div className="w-16">
                  <label className="text-xs text-gray-500">Vai</label>
                  <input 
                    className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-center font-bold text-yellow-200"
                    value={line.role}
                    onChange={e => updateLine(idx, 'role', e.target.value)}
                  />
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Chữ Hán</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-lg font-serif"
                      value={line.hanzi}
                      onChange={e => updateLine(idx, 'hanzi', e.target.value)}
                      placeholder="你好"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Pinyin</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-600 rounded p-1"
                      value={line.pinyin}
                      onChange={e => updateLine(idx, 'pinyin', e.target.value)}
                      placeholder="Nǐ hǎo"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Nghĩa Việt</label>
                    <input 
                      className="w-full bg-gray-800 border border-gray-600 rounded p-1"
                      value={line.meaning}
                      onChange={e => updateLine(idx, 'meaning', e.target.value)}
                      placeholder="Xin chào"
                    />
                  </div>
                </div>

                <button onClick={() => removeLine(idx)} className="mt-5 p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* NÚT LƯU */}
        <div className="fixed bottom-0 left-0 w-full bg-gray-900/90 border-t border-gray-700 p-4 flex justify-center backdrop-blur-md">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-600 text-black font-bold text-xl px-8 py-3 rounded-full hover:scale-105 transition shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              <Save /> {loading ? "Đang khắc bí kíp..." : "LƯU VÀO TÀNG KINH CÁC"}
            </button>
        </div>

        {/* Thông báo */}
        {message && (
          <div className="fixed top-4 right-4 bg-gray-800 border border-white/20 p-4 rounded shadow-2xl animate-pop-in z-50">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}