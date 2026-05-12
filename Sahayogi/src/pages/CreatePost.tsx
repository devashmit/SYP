import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X, MapPin, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import StoryHeader from '@/components/StoryHeader';
import HelpTypeToggle from '@/components/HelpTypeToggle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [descLength, setDescLength] = useState(0);
  const [helpType, setHelpType] = useState<'offering' | 'seeking'>('offering');
  const DESC_MAX = 2000;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch(`${API_URL}/categories`);
      setCategories(data);
    } catch {
      // silently fail - categories will just be empty
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    setSelectedImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('category') as string;
    const location = formData.get('location') as string;

    if (!title || !description || !categoryId) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const payload = {
        title,
        description,
        category_id: categoryId,
        location,
        intent: helpType === 'offering' ? 'OFFER_HELP' : 'ASK_HELP',
        is_anonymous: isAnonymous,
        images: imagePreviews
      };

      await apiFetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      toast.success('Post submitted! It will appear on the feed after admin approval.', {
        duration: 6000,
      });
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] relative overflow-hidden pt-20 pb-12 px-4 font-sans selection:bg-rose-100 selection:text-rose-900">
      <Navbar />

      {/* Dynamic Background Ambiance */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-rose-100/30 blur-[120px] rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-stone-100/30 blur-[120px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-rose-50/40 blur-[100px] rounded-full animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 animate-fade-in-up mt-4">
        {/* Main Card with Premium Depth */}
        <div className="bg-white rounded-[3rem] border border-stone-100 shadow-[0_32px_80px_-16px_rgba(45,35,30,0.06)] overflow-hidden transition-all duration-700 hover:shadow-[0_48px_96px_-24px_rgba(45,35,30,0.08)]">
          <div className="relative">
            {/* Subtle Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            
            <StoryHeader />
            
            <div className="px-6 sm:px-10 pt-6 pb-6 text-center relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2 animate-slide-up font-serif italic">
                  Where every story finds a home. जहाँ प्रत्येक कथाले स्थान पाउँछ।
              </h2>
              <p className="text-stone-500 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed animate-slide-up animation-delay-200 italic">
                  In the tapestry of our community, your voice is the golden thread. Share your journey, offer a hand, or ask for a light.
              </p>
            </div>

            <div className="px-6 sm:px-10 pb-8 space-y-6">
              {/* Type Selection Section */}
              <div className="animate-slide-up animation-delay-400">
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 text-center">
                  What are you looking for?
                </label>
                <HelpTypeToggle value={helpType} onChange={setHelpType} />
              </div>

              {/* Form Inputs Section */}
              <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up animation-delay-600">
                {/* Title Input */}
                <div className="space-y-2.5 group">
                  <label htmlFor="title" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 group-focus-within:text-rose-600 transition-colors duration-300">
                    Give your story a title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="E.g., Seeking volunteer help for local school..."
                    className="w-full h-14 px-7 bg-stone-50/50 border border-stone-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-200 focus:bg-white text-stone-800 placeholder:text-stone-300 transition-all duration-500 font-medium sm:text-base text-sm"
                    required
                  />
                </div>

                {/* Category & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5 group">
                    <label htmlFor="category" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 group-focus-within:text-rose-600 transition-colors duration-300">
                      Category
                    </label>
                    <Select name="category" required>
                      <SelectTrigger className="h-14 rounded-[1.2rem] border-stone-100 bg-stone-50/50 px-7 focus:ring-4 focus:ring-rose-50/50 focus:border-rose-200 focus:bg-white transition-all duration-500">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-stone-100 bg-white/95 backdrop-blur-md">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl focus:bg-rose-50 focus:text-rose-900 py-3 px-4">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5 group">
                    <label htmlFor="location" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 group-focus-within:text-rose-600 transition-colors duration-300">
                      Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none group-focus-within:text-rose-300 transition-colors" />
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g., Kathmandu"
                            className="w-full h-14 pl-12 pr-7 bg-stone-50/50 border border-stone-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-200 focus:bg-white text-stone-800 placeholder:text-stone-300 transition-all duration-500 font-medium sm:text-base text-sm"
                        />
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2.5 group">
                  <label htmlFor="description" className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 group-focus-within:text-rose-600 transition-colors duration-300">
                    Your detailed story
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Share the details, your goals, and how the community can get involved..."
                      rows={6}
                      className="w-full px-7 py-6 bg-stone-50/50 border border-stone-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-200 focus:bg-white text-stone-800 placeholder:text-stone-300 transition-all duration-500 leading-relaxed font-medium resize-none sm:text-base text-sm"
                      required
                      maxLength={DESC_MAX}
                      onChange={(e) => setDescLength(e.target.value.length)}
                    />
                  </div>
                  <div className="flex justify-end pr-2">
                    <span className={`text-[10px] font-bold tracking-widest ${descLength > DESC_MAX * 0.9 ? 'text-rose-600' : 'text-stone-300 uppercase'}`}>
                        {descLength} / {DESC_MAX}
                    </span>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4 group animate-slide-up animation-delay-700">
                  <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1 group-focus-within:text-rose-600 transition-colors duration-300">
                    Add Images (Max 5)
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {/* Preview Cards */}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-100 group/img shadow-sm hover:shadow-md transition-all duration-300">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-stone-600 hover:text-rose-600 shadow-sm opacity-0 group-hover/img:opacity-100 transition-all duration-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    {selectedImages.length < 5 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-100 hover:border-rose-200 hover:bg-rose-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group/upload">
                        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center group-hover/upload:bg-rose-100 group-hover/upload:text-rose-600 text-stone-400 transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Add</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium ml-1 italic">* Only images up to 5MB are supported</p>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-6 bg-stone-50/40 rounded-[1.5rem] border border-stone-100/60 transition-all duration-500 hover:bg-stone-50/60 group">
                    <div className="space-y-1">
                        <h4 className="text-stone-800 text-sm font-bold tracking-tight">Post Anonymously</h4>
                        <p className="text-stone-400 text-[11px] font-medium">Protect your identity while sharing support</p>
                    </div>
                    <Switch
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                        className="data-[state=checked]:bg-stone-900"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-[1.3rem] p-px transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-stone-200/50"
                  >
                    {/* Animated Shimmer Background for Button */}
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-400 to-stone-800 animate-shimmer" />
                    
                    <div className="relative flex items-center justify-center gap-3 px-8 py-5 bg-stone-900 rounded-[1.25rem] transition-all duration-500 group-hover:bg-transparent text-white font-bold tracking-wider uppercase text-sm">
                      {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
                            <span className="text-xs">Publishing...</span>
                        </div>
                      ) : (
                        <>
                          <span>Post Story</span>
                          <div className="translate-x-0 group-hover:translate-x-1.5 transition-transform duration-500">
                             <Plus className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                  <p className="mt-8 text-center text-[10px] sm:text-xs text-stone-400 font-medium">
                      By posting, you agree to our <span className="text-stone-500 hover:text-rose-500 transition-colors cursor-pointer decoration-stone-200 decoration-1 underline underline-offset-4">Community Guidelines</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-blob { animation: blob 15s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-fade-in-up { animation: fade-in-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { opacity: 0; animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .animation-delay-200 { animation-delay: 0.1s; }
        .animation-delay-400 { animation-delay: 0.2s; }
        .animation-delay-600 { animation-delay: 0.3s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />
    </div>
  );
};

export default CreatePost;
