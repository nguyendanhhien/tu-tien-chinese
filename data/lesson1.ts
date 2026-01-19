// src/data/lesson1.ts

export type DialogueLine = {
  id: number;
  role: "A" | "B";
  avatar: string; // Đường dẫn ảnh hoặc màu đại diện
  hanzi: string;
  pinyin: string;
  meaning: string;
  audio: string; // Đường dẫn file âm thanh (sẽ thêm sau)
};

export const lessonOneData = {
  id: "hsk1-01",
  title: "Luyện Khí Tầng 1: Tương Phùng", // Tên bài học kiểu Tu tiên
  original_title: "你好 - Xin chào",
  dialogues: [
    {
      id: 1,
      role: "A",
      avatar: "bg-blue-500",
      hanzi: "你好!",
      pinyin: "Nǐ hǎo!",
      meaning: "Chào bạn!",
      audio: "/audio/nihao.mp3"
    },
    {
      id: 2,
      role: "B",
      avatar: "bg-red-500",
      hanzi: "你好!",
      pinyin: "Nǐ hǎo!",
      meaning: "Chào bạn!",
      audio: "/audio/nihao.mp3"
    },
    {
      id: 3,
      role: "A",
      avatar: "bg-blue-500",
      hanzi: "您好!",
      pinyin: "Nín hǎo!",
      meaning: "Chào ngài (kính ngữ)!",
      audio: "/audio/ninhao.mp3"
    },
     {
      id: 4,
      role: "B",
      avatar: "bg-green-500",
      hanzi: "你们好!",
      pinyin: "Nǐmen hǎo!",
      meaning: "Chào các bạn!",
      audio: "/audio/nimenhao.mp3"
    },
    {
      id: 5,
      role: "A",
      avatar: "bg-yellow-500",
      hanzi: "对不起!",
      pinyin: "Duìbuqǐ!",
      meaning: "Xin lỗi!",
      audio: "/audio/duibuqi.mp3"
    },
     {
      id: 6,
      role: "B",
      avatar: "bg-purple-500",
      hanzi: "没关系!",
      pinyin: "Méi guānxi!",
      meaning: "Không sao đâu!",
      audio: "/audio/meiguanxi.mp3"
    }
  ] as DialogueLine[]
};