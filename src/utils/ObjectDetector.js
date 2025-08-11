import * as ort from 'onnxruntime-web';
import ColorAnalyzer from './ColorAnalyzer';

class ObjectDetector {
  constructor() {
    this.session = null;
    this.modelPath = process.env.PUBLIC_URL + '/models/yolov8n_testtube.onnx';
    this.classNamesPath = process.env.PUBLIC_URL + '/models/class_names.json';
    this.confidenceThreshold = 0.5; // Higher threshold for more accurate detections
    this.nmsThreshold = 0.4; // NMS threshold (same as before)
    this.iouThreshold = 0.2; // IoU threshold for NMS (lower = more aggressive filtering)
    this.inputShape = [1, 3, 640, 640];
    this.isDemoMode = false;
    this.colorAnalyzer = new ColorAnalyzer();
  }

  async initialize() {
    try {
      console.log('Initializing ONNX Runtime...');
      console.log('Model path:', this.modelPath);
      
      // Configure ONNX Runtime for web with local WASM files
      ort.env.wasm.wasmPaths = {
        'ort-wasm.wasm': process.env.PUBLIC_URL + '/onnx/ort-wasm.wasm',
        'ort-wasm-threaded.wasm': process.env.PUBLIC_URL + '/onnx/ort-wasm-threaded.wasm'
      };
      
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = false; // Disable SIMD for better compatibility
      ort.env.logLevel = 'warning'; // Reduce verbose logging
      
      // First, check if model is accessible
      console.log('Checking model accessibility...');
      const modelResponse = await fetch(this.modelPath);
      if (!modelResponse.ok) {
        console.warn(`Model file not found at ${this.modelPath}. Status: ${modelResponse.status}`);
        console.log('Falling back to demo mode...');
        this.isDemoMode = true;
        return true;
      }
      
      console.log('Model file accessible, size:', modelResponse.headers.get('content-length'), 'bytes');
      
      // Load the model with simpler configuration
      console.log('Loading ONNX model...');
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ['wasm'], // Only use WASM provider
        graphOptimizationLevel: 'disabled',
        enableCpuMemArena: false,
        enableMemPattern: false,
        executionMode: 'sequential',
        logSeverityLevel: 2, // Warning level
        logVerbosityLevel: 0 // Minimal verbosity
      });
      
      console.log('✅ Model loaded successfully!');
      console.log('Input names:', this.session.inputNames);
      console.log('Output names:', this.session.outputNames);
      
      // Get actual input/output shapes using correct API
      const inputMetadata = {};
      const outputMetadata = {};
      
      try {
        // Try different API methods for getting metadata
        for (const name of this.session.inputNames) {
          if (this.session.getInputMetadata) {
            inputMetadata[name] = this.session.getInputMetadata(name);
          } else if (this.session.inputNames.length > 0) {
            // Fallback - use default shape
            inputMetadata[name] = { dims: this.inputShape };
          }
        }
        
        for (const name of this.session.outputNames) {
          if (this.session.getOutputMetadata) {
            outputMetadata[name] = this.session.getOutputMetadata(name);
          }
        }
        
        console.log('Input metadata:', inputMetadata);
        console.log('Output metadata:', outputMetadata);
        
        // Update input shape if we got valid metadata
        const firstInputName = this.session.inputNames[0];
        if (inputMetadata[firstInputName] && inputMetadata[firstInputName].dims) {
          this.inputShape = inputMetadata[firstInputName].dims;
          console.log('Updated input shape:', this.inputShape);
        }
      } catch (metadataError) {
        console.warn('Could not get metadata, using default input shape:', this.inputShape);
      }
      
      this.isDemoMode = false;
      console.log('🎯 Real AI detection is now active!');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize detector:', error);
      console.error('Error details:', error.stack);
      console.log('🔄 Falling back to demo mode...');
      this.isDemoMode = true;
      return true; // Don't throw error, use demo mode instead
    }
  }

  preprocessImage(imageElement) {
    // Create canvas for image preprocessing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to model input size
    const [, , height, width] = this.inputShape;
    canvas.width = width;
    canvas.height = height;
    
    // Draw and resize image
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Convert to RGB and normalize (0-1) in CHW format
    const rgbData = new Float32Array(3 * width * height);
    
    for (let i = 0; i < width * height; i++) {
      const pixelIndex = i * 4; // RGBA
      
      // Convert RGBA to RGB and normalize to [0, 1] in CHW format
      rgbData[i] = data[pixelIndex] / 255.0;     // R channel
      rgbData[width * height + i] = data[pixelIndex + 1] / 255.0; // G channel
      rgbData[2 * width * height + i] = data[pixelIndex + 2] / 255.0; // B channel
    }
    
    // Return tensor in NCHW format
    return new ort.Tensor('float32', rgbData, this.inputShape);
  }

  postprocessDetections(output, originalWidth, originalHeight) {
    const data = output.data;
    const dims = output.dims;
    console.log('Raw output dimensions:', dims);
    console.log('Raw output data sample:', Array.from(data.slice(0, 20)));
    
    // YOLOv8 output format is typically [batch, 84, 8400] for COCO
    // For single class it might be [batch, 5, anchors] or [batch, anchors, 5]
    // Let's handle both cases
    
    let numDetections, numValues;
    let isTransposed = false;
    
    if (dims.length === 3) {
      const [batch, dim1, dim2] = dims;
      if (dim1 < dim2) {
        // Format: [batch, values, detections] - typical YOLOv8
        numValues = dim1;
        numDetections = dim2;
        isTransposed = false;
      } else {
        // Format: [batch, detections, values] - transposed
        numDetections = dim1;
        numValues = dim2;
        isTransposed = true;
      }
    } else if (dims.length === 2) {
      const [dim1, dim2] = dims;
      if (dim1 < dim2) {
        numValues = dim1;
        numDetections = dim2;
        isTransposed = false;
      } else {
        numDetections = dim1;
        numValues = dim2;
        isTransposed = true;
      }
    } else {
      console.error('Unexpected output format:', dims);
      return [];
    }
    
    console.log(`Processing ${numDetections} detections with ${numValues} values each (transposed: ${isTransposed})`);
    
    // Scale factors
    const [, , modelHeight, modelWidth] = this.inputShape;
    const scaleX = originalWidth / modelWidth;
    const scaleY = originalHeight / modelHeight;
    
    const detections = [];
    
    for (let i = 0; i < Math.min(numDetections, 8400); i++) { // Limit to reasonable number
      let x_center, y_center, width, height, confidence;
      
      if (isTransposed) {
        // Data is [detection][values]
        const startIdx = i * numValues;
        x_center = data[startIdx] * scaleX;
        y_center = data[startIdx + 1] * scaleY;
        width = data[startIdx + 2] * scaleX;
        height = data[startIdx + 3] * scaleY;
        
        if (numValues === 5) {
          confidence = data[startIdx + 4];
        } else {
          // Multiple classes - take max confidence
          let maxConf = 0;
          for (let j = 4; j < numValues; j++) {
            maxConf = Math.max(maxConf, data[startIdx + j]);
          }
          confidence = maxConf;
        }
      } else {
        // Data is [values][detection] - typical YOLOv8 format
        x_center = data[i] * scaleX;
        y_center = data[numDetections + i] * scaleY;
        width = data[2 * numDetections + i] * scaleX;
        height = data[3 * numDetections + i] * scaleY;
        
        if (numValues === 5) {
          confidence = data[4 * numDetections + i];
        } else {
          // Multiple classes - find max confidence starting from index 4
          let maxConf = 0;
          for (let j = 4; j < numValues; j++) {
            maxConf = Math.max(maxConf, data[j * numDetections + i]);
          }
          confidence = maxConf;
        }
      }
      
      // Debug first few detections
      if (i < 5) {
        console.log(`Detection ${i}: x=${x_center.toFixed(2)}, y=${y_center.toFixed(2)}, w=${width.toFixed(2)}, h=${height.toFixed(2)}, conf=${confidence.toFixed(4)}`);
      }
      
      // Filter by confidence threshold
      if (confidence >= this.confidenceThreshold) {
        // Convert center coordinates to top-left coordinates
        const x = x_center - width / 2;
        const y = y_center - height / 2;
        
        // Ensure coordinates are within bounds
        const clampedX = Math.max(0, Math.min(x, originalWidth - width));
        const clampedY = Math.max(0, Math.min(y, originalHeight - height));
        const clampedW = Math.min(width, originalWidth - clampedX);
        const clampedH = Math.min(height, originalHeight - clampedY);
        
        detections.push({
          bbox: [clampedX, clampedY, clampedW, clampedH],
          confidence: confidence,
          class_id: 0,
          class_name: 'test_tube'
        });
      } else if (i < 10) {
        // Log low-confidence detections for debugging
        console.log(`🔍 Filtered out detection ${i}: conf=${confidence.toFixed(4)} (below ${this.confidenceThreshold})`);
      }
    }
    
    console.log(`Found ${detections.length} detections above threshold ${this.confidenceThreshold}`);
    
    // Apply Non-Maximum Suppression
    const nmsDetections = this.applyNMS(detections);
    console.log(`After NMS: ${nmsDetections.length} detections`);
    
    return nmsDetections.slice(0, this.maxDetections);
  }

  applyNMS(detections) {
    if (detections.length === 0) return detections;
    
    console.log(`🔍 Applying NMS to ${detections.length} detections with IoU threshold ${this.iouThreshold}`);
    
    // Sort by confidence (descending)
    detections.sort((a, b) => b.confidence - a.confidence);
    
    const keep = [];
    const suppressed = new Set();
    
    for (let i = 0; i < detections.length; i++) {
      if (suppressed.has(i)) continue;
      
      const currentDetection = detections[i];
      keep.push(currentDetection);
      
      console.log(`✅ Keeping detection ${i} with confidence ${currentDetection.confidence.toFixed(3)}`);
      
      // Calculate IoU with remaining detections
      for (let j = i + 1; j < detections.length; j++) {
        if (suppressed.has(j)) continue;
        
        const iou = this.calculateIoU(currentDetection.bbox, detections[j].bbox);
        console.log(`📊 IoU between detection ${i} and ${j}: ${iou.toFixed(3)}`);
        
        if (iou > this.iouThreshold) {
          suppressed.add(j);
          console.log(`❌ Suppressing detection ${j} (IoU: ${iou.toFixed(3)} > ${this.iouThreshold})`);
        }
      }
    }
    
    console.log(`🎯 NMS result: kept ${keep.length} out of ${detections.length} detections`);
    return keep;
  }

  calculateIoU(box1, box2) {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;
    
    // Calculate intersection
    const xLeft = Math.max(x1, x2);
    const yTop = Math.max(y1, y2);
    const xRight = Math.min(x1 + w1, x2 + w2);
    const yBottom = Math.min(y1 + h1, y2 + h2);
    
    if (xRight <= xLeft || yBottom <= yTop) {
      return 0; // No intersection
    }
    
    const intersection = (xRight - xLeft) * (yBottom - yTop);
    const area1 = w1 * h1;
    const area2 = w2 * h2;
    const union = area1 + area2 - intersection;
    
    return intersection / union;
  }

  async detect(imageElement) {
    if (this.isDemoMode) {
      // Return mock detections for demo purposes
      console.log('🎭 Running in demo mode - showing mock detections');
      return this.getDemoDetections(imageElement);
    }

    if (!this.session) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    try {
      console.log('🔍 Running real AI detection...');
      
      // Get original image dimensions (handle both image and video elements)
      let originalWidth, originalHeight;
      if (imageElement.tagName === 'VIDEO') {
        originalWidth = imageElement.videoWidth;
        originalHeight = imageElement.videoHeight;
      } else {
        originalWidth = imageElement.naturalWidth || imageElement.width;
        originalHeight = imageElement.naturalHeight || imageElement.height;
      }
      console.log(`Image dimensions: ${originalWidth}x${originalHeight}`);
      
      if (!originalWidth || !originalHeight) {
        console.error('❌ Could not get valid image dimensions');
        return [];
      }
      
      // Preprocess image
      const inputTensor = this.preprocessImage(imageElement);
      console.log('Input tensor shape:', inputTensor.dims);
      
      // Run inference
      const inputName = this.session.inputNames[0];
      const feeds = { [inputName]: inputTensor };
      console.log('Running inference with input:', inputName);
      
      const results = await this.session.run(feeds);
      console.log('Inference completed');
      
      // Get output tensor
      const outputName = this.session.outputNames[0];
      const output = results[outputName];
      console.log('Output tensor shape:', output.dims);
      
      // Postprocess detections
      const detections = this.postprocessDetections(output, originalWidth, originalHeight);
      console.log(`🎯 Found ${detections.length} test tubes!`);
      
      // Add color analysis to each detection
      const detectionsWithColor = await this.addColorAnalysis(detections, imageElement);
      
      return detectionsWithColor;
    } catch (error) {
      console.error('❌ Detection error:', error);
      throw new Error(`Detection failed: ${error.message}`);
    }
  }

  async addColorAnalysis(detections, imageElement) {
    console.log('🎨 Starting HSV color analysis for', detections.length, 'test tubes...');
    
    // Create a canvas from the image element for color analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match the image
    if (imageElement.tagName === 'VIDEO') {
      canvas.width = imageElement.videoWidth;
      canvas.height = imageElement.videoHeight;
    } else {
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
    }
    
    // Draw the image/video frame to canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Analyze color for each detection using HSV color space
    const detectionsWithColor = detections.map((detection, index) => {
      console.log(`🎨 Analyzing color for test tube ${index + 1}...`);
      
      try {
        const colorResult = this.colorAnalyzer.analyzeTestTubeColor(canvas, detection.bbox);
        const colorDisplay = this.colorAnalyzer.getColorDisplay(colorResult);
        
        console.log(`🎨 Test tube ${index + 1} HSV result:`, colorResult.color, `(${colorResult.confidence}%)`);
        
        return {
          ...detection,
          color: {
            type: colorResult.color,
            confidence: colorResult.confidence,
            name: colorDisplay.name,
            displayColor: colorDisplay.color,
            emoji: colorDisplay.emoji,
            details: colorResult.details,
            method: 'HSV'
          }
        };
      } catch (error) {
        console.error(`❌ HSV color analysis failed for detection ${index}:`, error);
        // Default to blue if color analysis fails
        return {
          ...detection,
          color: {
            type: 'blue',
            confidence: 50,
            name: 'Blue',
            displayColor: '#0066CC',
            emoji: '🔵',
            details: {},
            method: 'HSV (fallback)'
          }
        };
      }
    });
    
    console.log('✅ HSV color analysis completed!');
    return detectionsWithColor;
  }

  getDemoDetections(imageElement) {
    // Generate mock detections for demo purposes
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;
    
    const mockDetections = [];
    
    // Add a few random mock detections
    for (let i = 0; i < Math.random() * 3 + 1; i++) {
      const x = Math.random() * (width * 0.6);
      const y = Math.random() * (height * 0.6);
      const w = Math.random() * 100 + 50;
      const h = Math.random() * 150 + 100;
      
      mockDetections.push({
        bbox: [x, y, w, h],
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        class_id: 0,
        class_name: 'test_tube (demo)'
      });
    }
    
    return mockDetections;
  }

  // Utility method to warm up the model
  async warmUp() {
    try {
      // Create a dummy image for warm-up
      const canvas = document.createElement('canvas');
      canvas.width = this.inputShape[3];
      canvas.height = this.inputShape[2];
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert canvas to image element
      const img = new Image();
      img.src = canvas.toDataURL();
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Run a dummy detection
      await this.detect(img);
      console.log('Model warmed up successfully');
    } catch (error) {
      console.warn('Model warm-up failed:', error);
    }
  }

  // Method to update detection thresholds
  setThresholds(confidence = 0.25, iou = 0.45) {
    this.confidenceThreshold = confidence;
    this.iouThreshold = iou;
  }

  // Method to get model info
  getModelInfo() {
    return {
      inputShape: this.inputShape,
      classNames: this.classNames,
      confidenceThreshold: this.confidenceThreshold,
      iouThreshold: this.iouThreshold,
      maxDetections: this.maxDetections
    };
  }
}

export default ObjectDetector;
