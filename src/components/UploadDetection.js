import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { FaUpload, FaTrash, FaDownload, FaEye, FaEyeSlash, FaWhatsapp } from 'react-icons/fa';
import { 
  Container, 
  Title, 
  SecondaryButton,
  DangerButton,
  IconButton, 
  ActionButton, 
  Controls, 
  Grid,
  ErrorMessage,
  DropzoneContainer,
  DropzoneIcon,
  DropzoneText,
  DropzoneSubtext,
  media 
} from './shared/UIComponents';
import ObjectDetector from '../utils/ObjectDetector';

const UploadContainer = styled(Container)`
  min-height: calc(100vh - 120px);

  ${media.mobile} {
    min-height: calc(100vh - 100px);
  }
`;





const ImageCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const UploadedImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;

const DetectionCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

const ImageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ImageName = styled.h4`
  margin: 0;
  color: #333;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DetectionInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

const DetectionStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: white;
  padding: 2rem;
  font-size: 1.1rem;
`;

const UploadDetection = ({ isModelLoaded, setIsModelLoaded, setModelError }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showDetections, setShowDetections] = useState(true);
  const detectorRef = useRef(null);

  // Initialize detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        if (!detectorRef.current) {
          detectorRef.current = new ObjectDetector();
          await detectorRef.current.initialize();
          setIsModelLoaded(true);
          setModelError(null);
        }
      } catch (err) {
        console.error('Failed to initialize detector:', err);
        setModelError(err.message);
        setError('Failed to load AI model. Please refresh the page.');
      }
    };

    initDetector();
  }, [setIsModelLoaded, setModelError]);

  // Handle window resize to maintain proper canvas scaling for uploaded images
  useEffect(() => {
    const handleResize = () => {
      // Redraw all detection canvases after a resize
      uploadedImages.forEach((image, index) => {
        const imageElements = document.querySelectorAll('.uploaded-image');
        const canvasElements = document.querySelectorAll('.detection-canvas');
        
        if (imageElements[index] && canvasElements[index]) {
          const imgElement = imageElements[index];
          const canvas = canvasElements[index];
          
          setTimeout(() => {
            const imgRect = imgElement.getBoundingClientRect();
            canvas.width = imgRect.width;
            canvas.height = imgRect.height;
            drawDetections(image, canvas);
          }, 100);
        }
      });
    };

    const debounceResize = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImages, showDetections]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!isModelLoaded) {
      setError('AI model is not loaded yet. Please wait...');
      return;
    }

    setIsProcessing(true);
    setError(null);

    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        try {
          const imageUrl = URL.createObjectURL(file);
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });

          // Perform detection
          const detections = await detectorRef.current.detect(img);
          
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            src: imageUrl,
            file,
            detections,
            timestamp: new Date().toLocaleString(),
            processed: true
          };

          setUploadedImages(prev => [...prev, newImage]);
        } catch (err) {
          console.error('Error processing image:', err);
          setError(`Failed to process ${file.name}: ${err.message}`);
        }
      }
    }

    setIsProcessing(false);
  }, [isModelLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    multiple: true
  });

  const drawDetections = (image, canvas) => {
    if (!image.detections || !showDetections) {
      // Clear canvas if detections are hidden
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const imgElement = canvas.previousElementSibling;
    if (!imgElement) return;

    // Get the actual displayed dimensions of the image element
    const imgRect = imgElement.getBoundingClientRect();
    const displayedWidth = imgRect.width;
    const displayedHeight = imgRect.height;

    // Set canvas size to match the displayed image size
    canvas.width = displayedWidth;
    canvas.height = displayedHeight;

    // Calculate scale factors between original image and displayed image
    const scaleX = displayedWidth / imgElement.naturalWidth;
    const scaleY = displayedHeight / imgElement.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    image.detections.forEach((detection) => {
      const { bbox, confidence, class_name, color } = detection;
      const [x, y, width, height] = bbox;

      // Scale coordinates to displayed image size
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      // Draw bounding box
      const borderColor = color?.displayColor || '#00ff00';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Create label with color information
      let labelText = `${class_name} ${(confidence * 100).toFixed(1)}%`;
      if (color && color.name) {
        labelText = `${color.emoji} ${color.name} (${(confidence * 100).toFixed(1)}%)`;
      }

      // Calculate label dimensions with responsive font size
      const fontSize = Math.max(10, Math.min(14, displayedWidth / 40)); // Responsive font size
      ctx.font = `${fontSize}px Arial`;
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = Math.max(textMetrics.width + 8, scaledWidth);
      const labelHeight = fontSize + 8;

      // Ensure label stays within canvas bounds
      const labelX = Math.min(scaledX, canvas.width - labelWidth);
      const labelY = Math.max(labelHeight, scaledY);

      // Draw background for label
      ctx.fillStyle = borderColor;
      ctx.fillRect(labelX, labelY - labelHeight, labelWidth, labelHeight);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(labelText, labelX + 4, labelY - 4);
    });
  };

  const removeImage = (id) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URLs
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.src);
      }
      return updated;
    });
  };

  const downloadImage = (image) => {
    // Create a canvas to combine image and detections
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Draw detections if enabled - use original image coordinates
      if (showDetections && image.detections) {
        image.detections.forEach((detection) => {
          const { bbox, confidence, class_name, color } = detection;
          const [x, y, width, height] = bbox;

          // Draw bounding box at original resolution
          const borderColor = color?.displayColor || '#00ff00';
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 4; // Slightly thicker for high-res image
          ctx.strokeRect(x, y, width, height);

          // Create label with color information
          let labelText = `${class_name} ${(confidence * 100).toFixed(1)}%`;
          if (color && color.name) {
            labelText = `${color.emoji} ${color.name} (${(confidence * 100).toFixed(1)}%)`;
          }

          // Calculate label dimensions at original resolution
          const fontSize = Math.max(16, img.width / 50); // Scale font with image size
          ctx.font = `${fontSize}px Arial`;
          const textMetrics = ctx.measureText(labelText);
          const labelWidth = Math.max(textMetrics.width + 10, width);
          const labelHeight = fontSize + 10;

          // Ensure label stays within image bounds
          const labelX = Math.min(x, img.width - labelWidth);
          const labelY = Math.max(labelHeight, y);

          // Draw background for label
          ctx.fillStyle = borderColor;
          ctx.fillRect(labelX, labelY - labelHeight, labelWidth, labelHeight);

          // Draw label text
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillText(labelText, labelX + 5, labelY - 5);
        });
      }

      // Download the image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `detected_${image.name}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg');
    };

    img.src = image.src;
  };

  const clearAllImages = () => {
    uploadedImages.forEach(img => URL.revokeObjectURL(img.src));
    setUploadedImages([]);
  };

  const downloadAllImages = () => {
    if (uploadedImages.length === 0) return;

    uploadedImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image);
      }, index * 100); // Stagger downloads by 100ms to avoid browser blocking
    });
  };

  const shareOnWhatsApp = () => {
    if (uploadedImages.length === 0) return;

    const totalDetections = uploadedImages.reduce((sum, img) => 
      sum + (img.detections ? img.detections.length : 0), 0
    );

    const colorCounts = {};
    uploadedImages.forEach(img => {
      if (img.detections) {
        img.detections.forEach(d => {
          if (d.color && d.color.name) {
            colorCounts[d.color.name] = (colorCounts[d.color.name] || 0) + 1;
          }
        });
      }
    });

    const colorSummary = Object.entries(colorCounts)
      .map(([color, count]) => `${color}: ${count}`)
      .join(', ');

    const message = encodeURIComponent(
      `🧬 Genetics App Analysis Results:\n\n` +
      `📊 Total Images: ${uploadedImages.length}\n` +
      `🧪 Test Tubes Detected: ${totalDetections}\n` +
      `🎨 Colors Found: ${colorSummary || 'None detected'}\n\n` +
      `Generated by Genetics App 🔬`
    );

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Also trigger download of all images for manual sharing
    setTimeout(() => {
      if (window.confirm('Download all images to share manually on WhatsApp?')) {
        downloadAllImages();
      }
    }, 1000);
  };

  const toggleDetections = () => {
    setShowDetections(prev => !prev);
  };

  const getDetectionSummary = (detections) => {
    if (!detections || detections.length === 0) {
      return { count: 0, avgConfidence: 0, colors: {} };
    }

    const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
    
    // Count colors
    const colors = {};
    detections.forEach(d => {
      if (d.color && d.color.name) {
        colors[d.color.name] = (colors[d.color.name] || 0) + 1;
      }
    });

    return { count: detections.length, avgConfidence, colors };
  };

  if (!isModelLoaded && !error) {
    return (
      <LoadingMessage>
        <div className="loading-spinner" style={{ marginRight: '10px' }}></div>
        Loading AI model, please wait...
      </LoadingMessage>
    );
  }

  return (
    <UploadContainer>
      <Title>Upload & Analyze Images</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DropzoneContainer {...getRootProps()} $isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <DropzoneIcon>
          <FaUpload />
        </DropzoneIcon>
        {isDragActive ? (
          <DropzoneText>Drop the images here...</DropzoneText>
        ) : (
          <>
            <DropzoneText>Drag & drop images here, or click to select</DropzoneText>
            <DropzoneSubtext>Supports JPG, PNG, WebP, and BMP formats</DropzoneSubtext>
          </>
        )}
      </DropzoneContainer>

      {(uploadedImages.length > 0 || isProcessing) && (
        <Controls>
          <SecondaryButton onClick={toggleDetections}>
            {showDetections ? <FaEyeSlash /> : <FaEye />}
            {showDetections ? 'Hide Detections' : 'Show Detections'}
          </SecondaryButton>
          
          {uploadedImages.length > 0 && (
            <>
              <IconButton onClick={downloadAllImages}>
                <FaDownload />
              </IconButton>
              
              <IconButton onClick={shareOnWhatsApp} $variant="whatsapp">
                <FaWhatsapp />
              </IconButton>
              
              <DangerButton onClick={clearAllImages}>
                <FaTrash />
                Clear All
              </DangerButton>
            </>
          )}
          
          {isProcessing && (
            <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="loading-spinner"></div>
              Processing images...
            </div>
          )}
        </Controls>
      )}

      {uploadedImages.length > 0 && (
        <Grid>
          {uploadedImages.map((image) => {
            const { count, avgConfidence, colors } = getDetectionSummary(image.detections);
            
            return (
              <ImageCard key={image.id}>
                <ImageContainer>
                  <UploadedImage
                    className="uploaded-image"
                    src={image.src}
                    alt={image.name}
                    onLoad={(e) => {
                      // Set up canvas for detections with proper sizing
                      const canvas = e.target.nextElementSibling;
                      if (canvas) {
                        // Use a small delay to ensure the image is fully rendered
                        setTimeout(() => {
                          const imgRect = e.target.getBoundingClientRect();
                          canvas.width = imgRect.width;
                          canvas.height = imgRect.height;
                          drawDetections(image, canvas);
                        }, 100);
                      }
                    }}
                  />
                  <DetectionCanvas
                    className="detection-canvas"
                    style={{
                      display: showDetections ? 'block' : 'none'
                    }}
                  />
                </ImageContainer>

                <ImageInfo>
                  <ImageName title={image.name}>{image.name}</ImageName>
                  <ImageActions>
                    <ActionButton onClick={() => downloadImage(image)}>
                      <FaDownload />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => removeImage(image.id)}
                      $variant="danger"
                    >
                      <FaTrash />
                    </ActionButton>
                  </ImageActions>
                </ImageInfo>

                <DetectionInfo>
                  <DetectionStats>
                    <StatItem>
                      <span>Test Tubes:</span>
                      <strong>{count}</strong>
                    </StatItem>
                    <StatItem>
                      <span>Avg Confidence:</span>
                      <strong>{(avgConfidence * 100).toFixed(1)}%</strong>
                    </StatItem>
                    <StatItem>
                      <span>Colors Detected:</span>
                      <strong>
                        {Object.keys(colors).length > 0 
                          ? Object.entries(colors).map(([color, count]) => 
                              `${color} (${count})`
                            ).join(', ')
                          : 'None'
                        }
                      </strong>
                    </StatItem>
                    <StatItem>
                      <span>Processed:</span>
                      <strong>{image.timestamp}</strong>
                    </StatItem>
                  </DetectionStats>
                </DetectionInfo>
              </ImageCard>
            );
          })}
        </Grid>
      )}
    </UploadContainer>
  );
};

export default UploadDetection;
