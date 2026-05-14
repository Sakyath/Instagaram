import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Smile } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';
import EmojiPicker from './EmojiPicker.jsx';

export default function CreatePostModal({ onClose }) {
  const [step, setStep] = useState('upload');
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    if (newFiles.length > 0) setStep('preview');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: true,
    maxFiles: 10,
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    if (files.length === 1) setStep('upload');
  };

  const handleShare = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f.file));
      formData.append('caption', caption);
      formData.append('location', location);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        toast.success('Post created successfully!');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          {step === 'upload' && <button onClick={onClose}><X className="w-5 h-5" /></button>}
          {step === 'preview' && <button onClick={() => setStep('upload')}><ChevronLeft className="w-5 h-5" /></button>}
          <h3 className="font-semibold text-sm">
            {step === 'upload' ? 'Create new post' : step === 'preview' ? 'Preview' : 'Details'}
          </h3>
          {step === 'preview' && (
            <button onClick={() => setStep('details')} className="text-blue-500 font-semibold text-sm">Next</button>
          )}
          {step === 'details' && (
            <button onClick={handleShare} disabled={isUploading} className="text-blue-500 font-semibold text-sm disabled:opacity-50">
              {isUploading ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div {...getRootProps()} className="p-12 flex flex-col items-center justify-center cursor-pointer min-h-[300px]">
            <input {...getInputProps()} />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 21h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3h-15a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.5 21z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              {isDragActive ? 'Drop files here' : 'Drag photos and videos here'}
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
              Select from computer
            </button>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && files.length > 0 && (
          <div className="relative aspect-square bg-black">
            {files[currentIndex].type === 'image' ? (
              <img src={files[currentIndex].preview} alt="" className="w-full h-full object-contain" />
            ) : (
              <video src={files[currentIndex].preview} className="w-full h-full object-contain" controls />
            )}

            {/* Carousel Controls */}
            {files.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button onClick={() => setCurrentIndex(currentIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentIndex < files.length - 1 && (
                  <button onClick={() => setCurrentIndex(currentIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {files.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnail strip */}
            <div className="absolute bottom-8 left-0 right-0 flex gap-1 px-2 overflow-x-auto">
              {files.map((f, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)} className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 border-white/50">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">&times;</button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <img src="/avatar-placeholder.png" alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full resize-none bg-transparent outline-none text-sm min-h-[80px]"
                  maxLength={2200}
                />
                <div className="flex items-center justify-between">
                  <button onClick={() => setShowEmoji(!showEmoji)} className="text-muted-foreground hover:text-foreground">
                    <Smile className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-muted-foreground">{caption.length}/2200</span>
                </div>
                {showEmoji && <EmojiPicker onSelect={(emoji) => setCaption(caption + emoji)} onClose={() => setShowEmoji(false)} />}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
