import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export const PropertyImageGallery = ({ images, title }: PropertyImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="relative group">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* View All Photos Overlay */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-background transition-all shadow-lg"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">View all {images.length} photos</span>
          </button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-primary shadow-md scale-105"
                  : "border-transparent hover:border-muted"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={(open) => {
        setIsLightboxOpen(open);
        if (!open) setZoomLevel(1);
      }}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <span className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md text-sm font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel})`,
                  cursor: zoomLevel > 1 ? 'move' : 'default',
                  maxWidth: zoomLevel > 1 ? 'none' : '100%',
                  maxHeight: zoomLevel > 1 ? 'none' : '100%',
                }}
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
