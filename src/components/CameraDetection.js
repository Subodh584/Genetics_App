import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import styled from 'styled-components';
import { FaCamera, FaPlay, FaStop, FaTrash, FaDownload, FaWhatsapp, FaShare } from 'react-icons/fa';
import { 
  Container, 
  Title, 
  PrimaryButton, 
  DangerButton, 
  SuccessButton,
  IconButton, 
  ActionButton, 
  Controls, 
  Card, 
  Grid,
  CameraWrapper,
  LoadingSpinner,
  ErrorMessage,
  media 
} from './shared/UIComponents';
import ObjectDetector from '../utils/ObjectDetector';

const CameraContainer = styled(Container)`
  text-align: center;
  min-height: calc(100vh - 120px);

  ${media.mobile} {
    min-height: calc(100vh - 100px);
  }
`;



const DetectionCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: inherit;
`;

const StatsPanel = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  ${media.mobile} {
    margin-bottom: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  ${media.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);

  ${media.mobile} {
    padding: 0.4rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ff88;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  ${media.mobile} {
    font-size: 1.2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;

  ${media.mobile} {
    font-size: 0.8rem;
  }
`;

const CapturedImagesContainer = styled.div`
  margin-top: 2rem;

  ${media.mobile} {
    margin-top: 1.5rem;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  ${media.mobile} {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const ImageCard = styled(Card)`
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }

  ${media.mobile} {
    &:hover {
      transform: translateY(-2px) scale(1.01);
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
`;

const CapturedImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;

  ${media.mobile} {
    height: 150px;
  }
`;

const ImageOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 8px;
`;

const ImageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const ImageName = styled.h4`
  margin: 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;

  ${media.mobile} {
    font-size: 0.9rem;
    text-align: center;
    white-space: normal;
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  ${media.mobile} {
    justify-content: center;
  }
`;

const DetectionInfo = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e9ecef;

  ${media.mobile} {
    padding: 0.75rem;
  }
`;

const DetectionStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  font-size: 0.9rem;

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    font-size: 0.8rem;
  }
`;

const StatItemDetection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-weight: 500;
  padding: 0.25rem 0;

  strong {
    color: #333;
    font-weight: 700;
  }

  ${media.mobile} {
    font-size: 0.85rem;
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.$isRecording ? '#ff4444' : '#4CAF50'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);

  ${media.mobile} {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin: 1rem 0;

  ${media.mobile} {
    font-size: 0.9rem;
    margin: 0.75rem 0;
  }
`;



const RemoveButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #cc0000;
  }
`;

// Add missing styled component
const CapturedImages = styled(CapturedImagesContainer)``;

const CameraDetection = ({ isModelLoaded, setIsModelLoaded, setModelError }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const animationRef = useRef(null);
  const isDetectingRef = useRef(false);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    confidence: 0,
    fps: 0
  });
  const [error, setError] = useState(null);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());

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

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "environment" // Use back camera on mobile
  };

  const drawDetections = useCallback((detections) => {
    console.log('🎨 drawDetections called with:', detections.length, 'detections');
    
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    
    console.log('🎨 Canvas and video state:', { 
      hasCanvas: !!canvas, 
      hasVideo: !!video,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight
    });
    
    if (!canvas || !video) {
      console.log('❌ Missing canvas or video for drawing');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('🎨 Canvas dimensions set to:', canvas.width, 'x', canvas.height);
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detections
    detections.forEach((detection, index) => {
      const { bbox, confidence, class_name, color } = detection;
      const [x, y, width, height] = bbox;
      
      console.log(`🎨 Drawing detection ${index}:`, { x, y, width, height, confidence, class_name, color: color?.type, method: color?.method });
      
      // Draw bounding box with color-coded border
      const borderColor = color?.displayColor || '#00ff00';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Create label text with color info
      const colorEmoji = color?.emoji || '';
      const colorName = color?.name || '';
      const methodTag = color?.method === 'HSV' ? ' 🎨' : '';
      const labelText = `${colorEmoji} ${class_name} ${(confidence * 100).toFixed(1)}%`;
      const colorText = color ? `${colorName} (${color.confidence}%)${methodTag}` : '';
      
      // Calculate label dimensions
      ctx.font = '14px Arial';
      const labelWidth = Math.max(
        ctx.measureText(labelText).width, 
        ctx.measureText(colorText).width
      ) + 10;
      const labelHeight = colorText ? 50 : 25;
      
      // Draw background for label
      ctx.fillStyle = borderColor;
      ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
      
      // Draw main label text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(labelText, x + 5, y - labelHeight + 18);
      
      // Draw color information if available
      if (colorText) {
        ctx.font = '12px Arial';
        ctx.fillText(colorText, x + 5, y - labelHeight + 35);
      }
    });
    
    console.log('✅ Finished drawing', detections.length, 'detections');
  }, []);

  const detectObjects = useCallback(async () => {
    console.log('🔍 detectObjects called:', { 
      isDetecting: isDetectingRef.current, 
      hasDetector: !!detectorRef.current, 
      hasWebcam: !!webcamRef.current 
    });
    
    if (!isDetectingRef.current || !detectorRef.current || !webcamRef.current) {
      console.log('❌ Early return from detectObjects:', {
        isDetecting: isDetectingRef.current,
        hasDetector: !!detectorRef.current,
        hasWebcam: !!webcamRef.current
      });
      return;
    }
    
    const video = webcamRef.current.video;
    console.log('📹 Video state:', { 
      hasVideo: !!video, 
      readyState: video?.readyState,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight
    });
    
    if (!video || video.readyState !== 4) {
      console.log('⏳ Video not ready, scheduling next frame');
      animationRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    try {
      console.log('🚀 Starting detection on video frame...');
      const detections = await detectorRef.current.detect(video);
      console.log('✅ Detection completed:', { 
        detectionCount: detections.length, 
        detections: detections.slice(0, 3) // Log first 3 detections
      });
      
      drawDetections(detections);
      
      // Update stats
      const now = Date.now();
      const fps = 1000 / (now - lastFrameTime);
      setLastFrameTime(now);
      
      const avgConfidence = detections.length > 0 
        ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length 
        : 0;
      
      setDetectionStats(prev => ({
        totalDetections: detections.length, // Current detections on screen, not cumulative
        confidence: avgConfidence,
        fps: fps
      }));
      
    } catch (err) {
      console.error('💥 Detection error:', err);
    }
    
    animationRef.current = requestAnimationFrame(detectObjects);
  }, [drawDetections, lastFrameTime]);

  const startDetection = () => {
    console.log('🎬 Start Detection clicked!', { 
      isModelLoaded, 
      hasDetector: !!detectorRef.current 
    });
    
    if (!isModelLoaded) {
      console.log('❌ Model not loaded yet');
      setError('AI model is not loaded yet. Please wait...');
      return;
    }
    
    console.log('✅ Starting detection loop...');
    setIsDetecting(true);
    isDetectingRef.current = true;
    setDetectionStats({ totalDetections: 0, confidence: 0, fps: 0 });
    setError(null);
    
    // Start detection immediately
    console.log('🚀 Starting detection after state update...');
    detectObjects();
  };

  const stopDetection = () => {
    setIsDetecting(false);
    isDetectingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    const canvas = canvasRef.current;
    
    if (imageSrc && canvas) {
      // Create a new canvas to combine video and detections
      const combinedCanvas = document.createElement('canvas');
      const combinedCtx = combinedCanvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        combinedCanvas.width = img.width;
        combinedCanvas.height = img.height;
        
        // Draw the captured image
        combinedCtx.drawImage(img, 0, 0);
        
        // Draw the detection overlay
        combinedCtx.drawImage(canvas, 0, 0);
        
        // Convert to data URL and save
        const combinedImageSrc = combinedCanvas.toDataURL('image/jpeg');
        const newImage = {
          id: Date.now(),
          src: combinedImageSrc,
          timestamp: new Date().toLocaleString()
        };
        
        setCapturedImages(prev => [newImage, ...prev]);
      };
      img.src = imageSrc;
    }
  }, []);

  const removeImage = (id) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };

  const downloadImage = (src, id) => {
    const link = document.createElement('a');
    link.download = `genetics-detection-${id}.jpg`;
    link.href = src;
    link.click();
  };

  const downloadAllImages = () => {
    if (capturedImages.length === 0) {
      alert('No images to download!');
      return;
    }

    capturedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `genetics-detection-${image.id || index + 1}.jpg`;
        link.href = image.src;
        link.click();
      }, index * 500); // Delay each download by 500ms to avoid browser blocking
    });
  };

  const shareOnWhatsApp = () => {
    if (capturedImages.length === 0) {
      alert('No images to share!');
      return;
    }

    // Create a summary message
    const message = `🧬 Genetics App Detection Results 🧬\n\n` +
      `📊 Total Captures: ${capturedImages.length}\n` +
      `🔬 Test Tube Detection Results\n` +
      `📅 Generated: ${new Date().toLocaleString()}\n\n` +
      `View detailed results in the attached images.\n\n` +
      `#GeneticsApp #TestTubeDetection #AI`;

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Also trigger download of all images for manual sharing
    setTimeout(() => {
      if (window.confirm('Download all images to share manually on WhatsApp?')) {
        downloadAllImages();
      }
    }, 1000);
  };

  const clearAllImages = () => {
    setCapturedImages([]);
  };

  return (
    <CameraContainer>
      <Title>Real-time Test Tube Detection</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <CameraWrapper>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ display: 'block' }}
        />
        <DetectionCanvas ref={canvasRef} />
        {isDetecting && (
          <StatusIndicator $isRecording={isDetecting}>
            <LoadingSpinner />
            Detecting...
          </StatusIndicator>
        )}
      </CameraWrapper>

      <Controls>
        {isDetecting ? (
          <DangerButton 
            onClick={stopDetection}
            disabled={!isModelLoaded}
          >
            <FaStop />
            Stop Detection
          </DangerButton>
        ) : (
          <SuccessButton 
            onClick={startDetection}
            disabled={!isModelLoaded}
          >
            <FaPlay />
            Start Detection
          </SuccessButton>
        )}
        
        <PrimaryButton 
          onClick={captureImage}
          disabled={!isDetecting}
        >
          <FaCamera />
          Capture
        </PrimaryButton>
        
        {capturedImages.length > 0 && (
          <>
            <IconButton onClick={downloadAllImages}>
              <FaDownload />
            </IconButton>
            
            <IconButton onClick={shareOnWhatsApp} $variant="whatsapp">
              <FaWhatsapp />
            </IconButton>
            
            <DangerButton 
              onClick={clearAllImages}
            >
              <FaTrash />
              Clear All
            </DangerButton>
          </>
        )}
      </Controls>

      {isDetecting && !isModelLoaded && (
        <LoadingIndicator>
          <LoadingSpinner />
          Loading AI model, please wait...
        </LoadingIndicator>
      )}

      {isDetecting && (
        <StatsPanel>
          <h3 style={{ margin: '0 0 1rem 0' }}>Detection Statistics</h3>
          <StatsGrid>
            <StatItem>
              <StatValue>{detectionStats.totalDetections}</StatValue>
              <StatLabel>Test Tubes Found</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{(detectionStats.confidence * 100).toFixed(1)}%</StatValue>
              <StatLabel>Avg Confidence</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{detectionStats.fps.toFixed(1)}</StatValue>
              <StatLabel>FPS</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsPanel>
      )}

      {capturedImages.length > 0 && (
        <CapturedImages>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'white', margin: 0 }}>
              Captured Images ({capturedImages.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionButton 
                onClick={downloadAllImages}
                $variant="success"
                title="Download All Images"
              >
                <FaDownload /> Download All
              </ActionButton>
              <ActionButton 
                onClick={shareOnWhatsApp}
                $variant="whatsapp"
                title="Share on WhatsApp"
              >
                <FaWhatsapp /> Share
              </ActionButton>
              <ActionButton 
                onClick={clearAllImages}
                $variant="danger"
                title="Clear All Images"
              >
                <FaTrash /> Clear All
              </ActionButton>
            </div>
          </div>
          <ImageGrid>
            {capturedImages.map((image) => (
              <ImageCard key={image.id}>
                <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                  <IconButton 
                    onClick={() => downloadImage(image.src, image.id)}
                    title="Download Image"
                    style={{ backgroundColor: '#4CAF50' }}
                  >
                    <FaDownload />
                  </IconButton>
                  <IconButton 
                    onClick={() => removeImage(image.id)}
                    title="Remove Image"
                    style={{ backgroundColor: '#f44336' }}
                  >
                    <FaTrash />
                  </IconButton>
                </div>
                <CapturedImage 
                  src={image.src} 
                  alt={`Captured ${image.timestamp}`}
                />
                <p style={{ color: 'white', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
                  {image.timestamp}
                </p>
              </ImageCard>
            ))}
          </ImageGrid>
        </CapturedImages>
      )}
    </CameraContainer>
  );
};

export default CameraDetection;
