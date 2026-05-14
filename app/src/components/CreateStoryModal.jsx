import { useState, useCallback } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';

export default function CreateStoryModal({ onClose }) {
  const [step, setStep] = useState('upload');
  const [files, setFiles] = useState([]);
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setFiles(newFiles);
    if (newFiles.length > 0) setStep('edit');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: true,
    maxFiles: 10,
  });

  const handleShare = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f.file));
      formData.append('text', text);

      const { data } = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        toast.success('Story shared!');
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create story');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-background rounded-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-border">
          {step === 'edit' && <button onClick={() => setStep('upload')}><ChevronLeft className="w-5 h-5" /></button>}
          {step === 'upload' && <button onClick={onClose}><X className="w-5 h-5" /></button>}
          <h3 className="font-semibold text-sm">{step === 'upload' ? 'Create story' : 'Preview'}</h3>
          {step === 'edit' && (
            <button onClick={handleShare} disabled={isUploading} className="text-blue-500 font-semibold text-sm disabled:opacity-50">
              {isUploading ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>

        {step === 'upload' && (
          <div {...getRootProps()} className="p-12 flex flex-col items-center justify-center cursor-pointer min-h-[300px]">
            <input {...getInputProps()} />
            <p className="text-muted-foreground text-sm mb-4">
              {isDragActive ? 'Drop files here' : 'Drag photos or videos here'}
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Select from computer</button>
          </div>
        )}

        {step === 'edit' && files.length > 0 && (
          <div className="p-4">
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4 relative">
              {files[0].type === 'image' ? (
                <img src={files[0].preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={files[0].preview} className="w-full h-full object-cover" controls />
              )}
              {text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-2xl font-bold text-center px-4 drop-shadow-lg">{text}</p>
                </div>
              )}
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add text..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent outline-none"
              maxLength={100}
            />
          </div>
        )}
      </div>
    </div>
  );
}
