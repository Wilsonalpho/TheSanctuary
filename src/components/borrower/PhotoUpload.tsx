import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (file: File | null, base64: string | null) => void;
  required?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [compressing, setCompressing] = useState<boolean>(false);

  // Compress image using canvas
  const processImage = (file: File) => {
    setCompressing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Target max dimension 1200px
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreview(compressedDataUrl);

          // Convert to blob / File
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name || 'book-photo.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                onPhotoSelected(compressedFile, compressedDataUrl);
              }
              setCompressing(false);
            },
            'image/jpeg',
            0.85
          );
        } else {
          setPreview(e.target?.result as string);
          onPhotoSelected(file, e.target?.result as string);
          setCompressing(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    onPhotoSelected(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase font-bold tracking-wider text-sanctuary-800 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-sanctuary-600" />
          <span>Photo of Book(s)</span>
          <span className="text-rose-500">*</span>
        </label>
        {preview && (
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
          </span>
        )}
      </div>

      {/* Hidden file inputs: one for direct camera, one for gallery/file chooser */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-sanctuary-300 bg-stone-900 group">
          <img
            src={preview}
            alt="Preview of borrowed books"
            className="w-full h-48 sm:h-56 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 flex items-end justify-between p-3">
            <span className="text-white text-xs font-medium truncate max-w-[200px]">
              {fileName || 'Book Photo'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-coffee-dark text-xs rounded-xl font-medium shadow-sm transition-all flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" /> Retake
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-sanctuary-300 rounded-2xl p-5 text-center bg-white/60 hover:bg-sanctuary-50/70 transition-colors">
          {compressing ? (
            <div className="py-4 text-xs text-sanctuary-700 font-medium animate-pulse">
              Processing image for fast upload...
            </div>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sanctuary-100 flex items-center justify-center text-sanctuary-700 mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-coffee-dark mb-1">
                Take a photo of the books being borrowed
              </p>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto mb-4">
                Snap the covers on your table or counter for quick verification.
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-sanctuary-800 hover:bg-sanctuary-900 text-white text-xs font-semibold rounded-xl shadow-warm transition-all flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 border border-sanctuary-300 hover:bg-white text-coffee-dark text-xs font-medium rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sanctuary-600" />
                  Choose File
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
