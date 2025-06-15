import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { X, Upload as UploadIcon, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Define the accepted file types for different upload types
const ACCEPTED_TYPES = {
  logo: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/avif': ['.avif'],
    'image/svg+xml': ['.svg'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    'image/x-icon': ['.ico']
  },
  background: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/avif': ['.avif'],
    'image/svg+xml': ['.svg'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/ogg': ['.ogg']
  }
};

// Define the accepted file extensions for validation messages
const ACCEPTED_EXTENSIONS = {
  logo: ".png, .jpg, .jpeg, .webp, .gif, .svg, .bmp, .ico",
  background: ".png, .jpg, .jpeg, .webp, .gif, .svg, .bmp, .mp4, .webm, .ogg"
};

// GIPHY API key
const GIPHY_API_KEY = "xEKMkDOjKgZ4k1p9YHJ3PXU5XYDkDUIf";

interface MediaUploaderProps {
  type: "logo" | "background";
  onUpload: (mediaUrl: string) => void;
}

export function MediaUploader({ type, onUpload }: MediaUploaderProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "giphy" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // GIPHY related states
  const [searchTerm, setSearchTerm] = useState("");
  const [giphyResults, setGiphyResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);

  // Handle modal open/close
  const openModal = () => {
    setIsModalOpen(true);
    setActiveTab(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    setSearchTerm("");
    setGiphyResults([]);
    setSelectedGif(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTab(null);
    setUploadedFile(null);
    setPreviewUrl(null);
    
    // Clean up object URLs to prevent memory leaks
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadedFile(file);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES[type],
    maxSize: 50 * 1024 * 1024, // 50MB limit
    multiple: false
  });

  // Handle file upload to server
  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const fieldName = type === 'logo' ? 'logo' : 'backgroundImage';
      formData.append(fieldName, uploadedFile);

      // Upload with progress tracking
      const response = await axios.post('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      // Call the onUpload callback with the uploaded file URL
      if (response.data && response.data[fieldName]) {
        onUpload(response.data[fieldName]);
        toast({
          title: "Upload successful",
          description: `Your ${type} has been updated.`
        });
        closeModal();
      } else {
        throw new Error("Upload failed: No URL returned");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // GIPHY search handler
  const searchGiphy = async (term: string) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=25&rating=g`
      );
      
      if (response.data && response.data.data) {
        setGiphyResults(response.data.data);
      }
    } catch (error) {
      console.error("GIPHY search error:", error);
      toast({
        title: "GIPHY search failed",
        description: "Failed to fetch GIFs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle GIPHY selection and upload
  const handleGiphySelect = async (gif: any) => {
    setSelectedGif(gif.id);
    setIsUploading(true);

    try {
      // Get the original or downsampled version of the GIF
      const gifUrl = gif.images.original.url;
      
      // Download the GIF and upload it to your server
      const response = await axios.get(gifUrl, { responseType: 'blob' });
      const gifBlob = response.data;
      
      // Create a File object from the Blob
      const gifFile = new File([gifBlob], `giphy-${gif.id}.gif`, { type: 'image/gif' });
      
      // Upload the file
      const formData = new FormData();
      const fieldName = type === 'logo' ? 'logo' : 'backgroundImage';
      formData.append(fieldName, gifFile);

      const uploadResponse = await axios.post('/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      // Call the onUpload callback with the uploaded file URL
      if (uploadResponse.data && uploadResponse.data[fieldName]) {
        onUpload(uploadResponse.data[fieldName]);
        toast({
          title: "GIPHY upload successful",
          description: `Your ${type} has been updated with the selected GIF.`
        });
        closeModal();
      } else {
        throw new Error("GIPHY upload failed: No URL returned");
      }
    } catch (error) {
      console.error("GIPHY upload error:", error);
      toast({
        title: "GIPHY upload failed",
        description: error instanceof Error ? error.message : "Failed to upload GIF",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setSelectedGif(null);
    }
  };

  // Determine if the file is a video
  const isVideo = (file: File | null) => {
    if (!file) return false;
    return file.type.startsWith('video/');
  };

  // Render preview based on file type
  const renderPreview = () => {
    if (!previewUrl) return null;

    if (uploadedFile && isVideo(uploadedFile)) {
      return (
        <video 
          src={previewUrl}
          className="max-w-full max-h-[300px] rounded-md object-contain"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      );
    }

    return (
      <img 
        src={previewUrl} 
        alt="Preview" 
        className="max-w-full max-h-[300px] rounded-md object-contain" 
      />
    );
  };

  return (
    <>
      <Button 
        onClick={openModal}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <UploadIcon className="w-4 h-4" />
        Upload {type === "logo" ? "Logo" : "Background"}
      </Button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/80" onClick={closeModal}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            {/* Modal */}
            <div 
              className="relative z-10 bg-black border border-white/10 rounded-lg w-full max-w-md p-6 overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                style={{ width: '100%' }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {activeTab === null && `Upload ${type === "logo" ? "Logo" : "Background"}`}
                    {activeTab === "upload" && "File Upload"}
                    {activeTab === "giphy" && "GIPHY Search"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Content */}
                {activeTab === null && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-colors"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <UploadIcon className="w-10 h-10 text-blue-400" />
                      </motion.div>
                      <span className="text-lg font-medium">📁 Upload</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("giphy")}
                      className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-800/20 border border-purple-500/30 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#d946ef" />
                          <path d="M13 7H11V13H17V11H13V7Z" fill="#d946ef" />
                        </svg>
                      </motion.div>
                      <span className="text-lg font-medium">🎞 GIPHY</span>
                    </button>
                  </div>
                )}

                {/* File Upload Tab */}
                {activeTab === "upload" && (
                  <div className="space-y-4">
                    {!uploadedFile ? (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                          isDragActive ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: isDragActive ? -10 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <UploadIcon className="w-12 h-12 text-white/60" />
                          </motion.div>
                          <p className="text-white/80">
                            {isDragActive
                              ? "Drop the file here..."
                              : "Drag & drop a file here, or click to select"}
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            Accepted formats: {ACCEPTED_EXTENSIONS[type]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border border-white/20 rounded-lg p-4 flex flex-col items-center">
                          {renderPreview()}
                          <div className="w-full mt-4 flex justify-between items-center">
                            <span className="text-sm truncate max-w-[200px]">
                              {uploadedFile.name}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (previewUrl) URL.revokeObjectURL(previewUrl);
                                setUploadedFile(null);
                                setPreviewUrl(null);
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab(null)}
                            disabled={isUploading}
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="relative overflow-hidden"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading {uploadProgress}%
                                <div
                                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </>
                            ) : (
                              "Upload"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* GIPHY Tab */}
                {activeTab === "giphy" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search GIPHY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            searchGiphy(searchTerm);
                          }
                        }}
                        className="bg-black/50 border-white/20"
                      />
                      <Button
                        onClick={() => searchGiphy(searchTerm)}
                        disabled={isSearching || !searchTerm.trim()}
                      >
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {isSearching ? (
                      <div className="h-60 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                      </div>
                    ) : giphyResults.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {giphyResults.map((gif) => (
                          <div
                            key={gif.id}
                            className={`relative rounded-md overflow-hidden cursor-pointer ${
                              selectedGif === gif.id ? "ring-2 ring-blue-500" : ""
                            }`}
                            onClick={() => handleGiphySelect(gif)}
                          >
                            <img
                              src={gif.images.fixed_height_small.url}
                              alt={gif.title}
                              className="w-full h-auto object-cover aspect-square"
                            />
                            {selectedGif === gif.id && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : searchTerm ? (
                      <div className="h-40 flex items-center justify-center text-white/60">
                        No results found. Try a different search term.
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-white/60">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9ca3af" />
                          <path d="M13 7H11V13H17V11H13V7Z" fill="#9ca3af" />
                        </svg>
                        <p className="mt-2">Search for GIFs to use as your {type}</p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab(null)}
                        disabled={isUploading}
                      >
                        Back
                      </Button>
                      {giphyResults.length > 0 && (
                        <p className="text-xs text-white/50 italic self-center">
                          Powered by GIPHY
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 