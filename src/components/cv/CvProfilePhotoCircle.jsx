import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { compressImageFileToDataUrl } from '../../services/cv/cvProfilePhoto';

export function CvProfilePhotoCircle({
  src,
  editable = false,
  onUpload,
  onRemove,
  sizeClass = 'cv-photo-md',
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    if (!editable || loading) return;
    setError('');
    inputRef.current?.click();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUpload) return;
    setLoading(true);
    setError('');
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      onUpload(dataUrl);
    } catch (err) {
      setError(err.message || 'Could not load image');
    } finally {
      setLoading(false);
    }
  };

  const circle = (
    <button
      type="button"
      className={`cv-photo-circle ${sizeClass} ${editable ? 'cv-photo-circle-editable' : ''} ${src ? 'has-image' : 'is-empty'}`}
      onClick={editable ? openPicker : undefined}
      disabled={!editable || loading}
      aria-label={src ? 'Change profile photo' : 'Upload profile photo'}
    >
      {src ? (
        <img src={src} alt="" className="cv-photo object-cover" />
      ) : (
        <span className="cv-photo-placeholder">
          <Camera size={editable ? 22 : 18} strokeWidth={1.6} />
          {editable && <span className="cv-photo-placeholder-text">{loading ? '…' : 'Add photo'}</span>}
        </span>
      )}
    </button>
  );

  return (
    <div className="cv-photo-upload-wrap">
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      )}
      {circle}
      {editable && src && onRemove && (
        <button type="button" className="cv-photo-remove no-print" onClick={onRemove}>
          <X size={12} />
          Remove photo
        </button>
      )}
      {editable && error && <p className="cv-photo-error no-print">{error}</p>}
    </div>
  );
}
