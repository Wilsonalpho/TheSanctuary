import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Check } from 'lucide-react';

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

  const processImage = (file: File) => {
    setCompressing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] uppercase font-semibold tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-zinc-400" />
          <span>Photo of Book(s)</span>
          <span className="text-zinc-400">*</span>
        </label>
        {preview && (
          <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3 text-zinc-900" /> Attached
          </span>
        )}
      </div>

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
        <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900">
          <img
            src={preview}
            alt="Preview of borrowed books"
            className="w-full h-44 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-end justify-between p-2.5">
            <span className="text-white text-[11px] truncate max-w-[180px]">
              {fileName || 'Book Photo'}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-2 py-1 bg-white/90 hover:bg-white text-zinc-900 text-[11px] rounded-md font-medium transition-colors flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Retake
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-md transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl p-4 text-center bg-zinc-50/50 transition-colors">
          {compressing ? (
            <div className="py-3 text-[11px] text-zinc-500 font-medium">
              Processing image...
            </div>
          ) : (
            <>
              <div className="w-9 h-9 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 mb-2">
                <Camera className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-zinc-800 mb-0.5">
                Take a photo of the books being borrowed
              </p>
              <p className="text-[10px] text-zinc-400 max-w-xs mx-auto mb-3">
                Quick snapshot of the book covers on the counter.
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3 h-3" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3 h-3 text-zinc-400" />
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
