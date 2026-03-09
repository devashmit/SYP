import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import postImage from '@/assets/Post.png';

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
  const DESC_MAX = 2000;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch(`${API_URL}/categories`);
      setCategories(data);
    } catch {
      // silently fail — categories will just be empty
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
    const helpType = formData.get('helpType') as 'offering' | 'seeking';

    if (!title || !description || !categoryId || !helpType) {
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
        help_type: helpType,
        is_anonymous: isAnonymous,
        images: imagePreviews
      };

      const data = await apiFetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      toast.success('Posted successfully!');
      navigate('/browse');
    } catch (error: any) {
      toast.error(error.message, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full flex flex-col">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${postImage})` }}
      />
      <div className="absolute inset-0 z-[1] bg-black/50" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <Card className="rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-md dark:bg-neutral-900/90">
              <CardHeader className="bg-muted/5 border-b border-border/50 pb-8">
                <div
                  className="w-full h-40 sm:h-48 lg:h-56 overflow-hidden rounded-2xl mb-6 bg-muted/20 bg-no-repeat bg-center bg-contain sm:bg-cover"
                  style={{ backgroundImage: `url(${postImage})` }}
                  role="img"
                  aria-label="Create post banner"
                />
                <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Share Your Story</CardTitle>
                <CardDescription className="text-foreground/40 font-medium">
                  Whether you're offering help or seeking support, your post can make a difference in Nepal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Help Type */}
                  <div className="space-y-3">
                    <Label>I am</Label>
                    <RadioGroup name="helpType" defaultValue="offering" className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 border border-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors group">
                        <RadioGroupItem value="offering" id="offering" className="text-primary border-primary/20 mt-1" />
                        <Label htmlFor="offering" className="cursor-pointer flex-1 flex flex-col gap-1.5 leading-tight">
                          <div className="font-bold text-foreground leading-tight">Offering Help</div>
                          <div className="text-[10px] text-foreground/40 uppercase tracking-widest leading-snug whitespace-normal">I have something to give</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-3 border border-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors group">
                        <RadioGroupItem value="seeking" id="seeking" className="text-primary border-primary/20 mt-1" />
                        <Label htmlFor="seeking" className="cursor-pointer flex-1 flex flex-col gap-1.5 leading-tight">
                          <div className="font-bold text-foreground leading-tight">Seeking Help</div>
                          <div className="text-[10px] text-foreground/40 uppercase tracking-widest leading-snug whitespace-normal">I need support</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Brief description of what you're offering or need"
                      className="rounded-xl border-border focus:ring-primary/20 bg-background"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger className="rounded-xl border-border focus:ring-primary/20 bg-background">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide details about your situation or what you're offering"
                      className="rounded-xl border-border focus:ring-primary/20 bg-background"
                      rows={6}
                      required
                      maxLength={DESC_MAX}
                      onChange={(e) => setDescLength(e.target.value.length)}
                    />
                    <div className="flex justify-end">
                      <span className={`text-[11px] font-medium ${descLength > DESC_MAX * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {descLength}/{DESC_MAX}
                      </span>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="images" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Images (Optional)</Label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-border hover:bg-primary/5 hover:text-primary transition-all"
                          onClick={() => document.getElementById('image-input')?.click()}
                          disabled={selectedImages.length >= 5}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Add Images
                        </Button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                          {selectedImages.length}/5 images
                        </span>
                      </div>
                      <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload up to 5 images (max 5MB each). JPG, PNG, or WebP format.
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">General Location (Optional)</Label>
                    <Input
                      id="location"
                      name="location"
                      className="rounded-xl border-border focus:ring-primary/20 bg-background"
                      placeholder="e.g., Kathmandu, Pokhara (keep it general for privacy)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only share your general area. Exact addresses will be shared privately later.
                    </p>
                  </div>

                  {/* Anonymous */}
                  <div className="flex items-center justify-between p-4 bg-muted/5 rounded-xl border border-border">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous" className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/60">Post Anonymously</Label>
                      <p className="text-xs text-foreground/40">
                        Hide your username from public view
                      </p>
                    </div>
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Post...
                      </>
                    ) : (
                      'Create Post'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
