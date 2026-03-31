import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Camera, FlaskConical, X, Send, Sprout, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TRANSLATIONS } from '../constants';
import { askFarmingExpert } from '../services/geminiService';

interface ChatProps {
  lang: 'en' | 'fr' | 'tn';
  chatMessages: { role: 'user' | 'ai', content: string, image?: string }[];
  setChatMessages: React.Dispatch<React.SetStateAction<{ role: 'user' | 'ai', content: string, image?: string }[]>>;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadInputRef: React.RefObject<HTMLInputElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function Chat({
  lang,
  chatMessages,
  setChatMessages,
  isTyping,
  setIsTyping,
  selectedImage,
  setSelectedImage,
  chatInput,
  setChatInput,
  fileInputRef,
  uploadInputRef,
  chatEndRef
}: ChatProps) {
  const t = TRANSLATIONS[lang];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedImage) return;

    const userMessage = chatInput || (selectedImage ? "Analyze this plant image." : "");
    const currentImage = selectedImage;
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, image: currentImage || undefined }]);
    setChatInput('');
    setSelectedImage(null);
    setIsTyping(true);

    let imageBase64 = "";
    let mimeType = "";
    if (currentImage) {
      const parts = currentImage.split(',');
      mimeType = parts[0].match(/:(.*?);/)?.[1] || "";
      imageBase64 = parts[1];
    }

    const aiResponse = await askFarmingExpert(userMessage, imageBase64, mimeType);
    setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-earth-50 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-earth-100 flex flex-col overflow-hidden h-[80vh]">
        <div className="p-6 bg-olive-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Sprout className="w-7 h-7 text-olive-400" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg">Argo Expert</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Online</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-earth-50/30 custom-scrollbar">
          {chatMessages.length === 0 && (
            <div className="text-center py-16">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-olive-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-olive-600"
              >
                <MessageSquare className="w-10 h-10" />
              </motion.div>
              <h4 className="text-xl font-serif font-bold text-olive-900 mb-2 text-balance">{t.consult}</h4>
              <p className="text-sm text-olive-800/60 px-12 leading-relaxed mb-8">Ask about Tunisian soil, modern irrigation, or upload a plant photo for AI diagnosis.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {t.scanYourPlant}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => uploadInputRef.current?.click()}
                  className="px-8 py-4 bg-olive-900 text-white rounded-2xl font-bold shadow-xl shadow-olive-100 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t.uploadPhoto}
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const sampleImage = "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=800";
                  setChatMessages([{ role: 'user', content: "Analyze this plant image for pests.", image: sampleImage }]);
                  setIsTyping(true);
                  const aiResponse = await askFarmingExpert("Analyze this plant image for pests.", "", "");
                  setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
                  setIsTyping(false);
                }}
                className="px-8 py-4 bg-olive-100 text-olive-900 rounded-2xl font-bold flex items-center gap-2 mx-auto"
              >
                <FlaskConical className="w-5 h-5" />
                Try Sample Analysis
              </motion.button>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] space-y-3`}>
                {msg.image && (
                  <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                    <img src={msg.image} alt="Uploaded" className="max-w-full h-auto" />
                  </div>
                )}
                <div className={`p-4 rounded-[24px] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-olive-900 text-white rounded-tr-none' 
                    : 'bg-white text-olive-900 border border-earth-100 rounded-tl-none'
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-earth-100 rounded-tl-none">
                <div className="flex gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 pb-2">
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-olive-500"
              >
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-olive-900 text-white p-1 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-earth-100 flex gap-3">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-earth-100 text-olive-600 rounded-2xl hover:bg-earth-200 transition-colors"
            title={t.scanPlant}
          >
            <Camera className="w-6 h-6" />
          </button>
          <button 
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="p-4 bg-earth-100 text-olive-600 rounded-2xl hover:bg-earth-200 transition-colors"
            title={t.uploadPhoto}
          >
            <Plus className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-grow px-6 py-4 bg-earth-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-olive-500 transition-all"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            className="p-4 bg-olive-900 text-white rounded-2xl shadow-lg shadow-olive-100 hover:bg-olive-800 transition-colors"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
