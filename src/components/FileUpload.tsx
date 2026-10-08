import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
}

export default function FileUpload({ photos, onChange, label = 'Photos' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const readers: Promise<string>[] = [];
    Array.from(files).forEach(file => {
      readers.push(new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));
    });
    Promise.all(readers).then(newPhotos => onChange([...photos, ...newPhotos]));
  };

  return (
    <div>
      <p className="data-label mb-2">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700">
            <img src={photo} alt={`upload-${i}`} className="w-full h-full object-cover" />
            <button
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-red-500 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Upload size={18} />
          <span className="text-[10px]">Upload</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
