import * as tf from '@tensorflow/tfjs';

class CNNColorClassifier {
  constructor() {
    this.model = null;
    this.inputSize = 64; // 64x64 input images for the CNN
    this.classes = ['blue', 'purple', 'other'];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Real CNN Color Classifier...');
      
      // Try to load pre-trained model first
      try {
        const modelUrl = process.env.PUBLIC_URL + '/models/color_classifier/model.json';
        this.model = await tf.loadLayersModel(modelUrl);
        console.log('✅ Loaded pre-trained CNN model!');
      } catch (error) {
        console.log('📚 No pre-trained model found, creating and training new CNN...');
        await this.createAndTrainModel();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize CNN:', error);
      return false;
    }
  }

  // Create and train a real CNN model
  async createAndTrainModel() {
    console.log('🏗️ Creating CNN architecture...');
    
    // Build CNN model
    this.model = tf.sequential({
      layers: [
        // First Convolutional Block
        tf.layers.conv2d({
          inputShape: [this.inputSize, this.inputSize, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // Second Convolutional Block
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // Third Convolutional Block
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        // Flatten and Dense layers
        tf.layers.flatten(),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // 3 classes: blue, purple, other
      ]
    });

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('🧠 CNN Architecture created successfully!');
    this.model.summary();

    // Generate synthetic training data for color classification
    await this.trainWithSyntheticData();
  }

  // Generate synthetic training data and train the model
  async trainWithSyntheticData() {
    console.log('📊 Generating synthetic training data...');
    
    const batchSize = 32;
    const epochs = 20;
    const samplesPerClass = 200;
    
    // Generate training data
    const { trainX, trainY } = this.generateColorTrainingData(samplesPerClass);
    
    console.log('🏋️ Training CNN model...');
    console.log(`Training data shape: ${trainX.shape}`);
    console.log(`Training labels shape: ${trainY.shape}`);
    
    // Train the model
    const history = await this.model.fit(trainX, trainY, {
      batchSize: batchSize,
      epochs: epochs,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}/${epochs}: loss=${logs.loss.toFixed(4)}, accuracy=${logs.acc.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`);
        }
      }
    });
    
    console.log('✅ CNN training completed!');
    
    // Clean up training data
    trainX.dispose();
    trainY.dispose();
  }

  // Generate synthetic color data for training
  generateColorTrainingData(samplesPerClass) {
    const totalSamples = samplesPerClass * 3;
    const imageData = [];
    const labels = [];
    
    // Generate blue samples
    for (let i = 0; i < samplesPerClass; i++) {
      const image = this.generateColorImage('blue');
      imageData.push(image);
      labels.push([1, 0, 0]); // blue = [1,0,0]
    }
    
    // Generate purple samples
    for (let i = 0; i < samplesPerClass; i++) {
      const image = this.generateColorImage('purple');
      imageData.push(image);
      labels.push([0, 1, 0]); // purple = [0,1,0]
    }
    
    // Generate other color samples
    for (let i = 0; i < samplesPerClass; i++) {
      const image = this.generateColorImage('other');
      imageData.push(image);
      labels.push([0, 0, 1]); // other = [0,0,1]
    }
    
    // Convert to tensors
    const trainX = tf.tensor4d(imageData, [totalSamples, this.inputSize, this.inputSize, 3]);
    const trainY = tf.tensor2d(labels, [totalSamples, 3]);
    
    return { trainX, trainY };
  }

  // Generate synthetic color images for training
  generateColorImage(colorType) {
    const image = new Array(this.inputSize * this.inputSize * 3);
    
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        const pixelIndex = (i * this.inputSize + j) * 3;
        
        let r, g, b;
        
        if (colorType === 'blue') {
          // Generate blue variations
          r = Math.random() * 0.3; // Low red
          g = Math.random() * 0.5 + 0.2; // Medium green
          b = Math.random() * 0.4 + 0.6; // High blue
        } else if (colorType === 'purple') {
          // Generate purple variations
          r = Math.random() * 0.4 + 0.4; // Medium-high red
          g = Math.random() * 0.3; // Low green
          b = Math.random() * 0.4 + 0.5; // High blue
        } else {
          // Generate other colors (green, yellow, red, etc.)
          if (Math.random() < 0.33) {
            // Green
            r = Math.random() * 0.3;
            g = Math.random() * 0.4 + 0.6;
            b = Math.random() * 0.3;
          } else if (Math.random() < 0.66) {
            // Red
            r = Math.random() * 0.4 + 0.6;
            g = Math.random() * 0.3;
            b = Math.random() * 0.3;
          } else {
            // Yellow/other
            r = Math.random() * 0.4 + 0.6;
            g = Math.random() * 0.4 + 0.6;
            b = Math.random() * 0.3;
          }
        }
        
        // Add some noise and variations
        r += (Math.random() - 0.5) * 0.1;
        g += (Math.random() - 0.5) * 0.1;
        b += (Math.random() - 0.5) * 0.1;
        
        // Clamp values
        image[pixelIndex] = Math.max(0, Math.min(1, r));     // R
        image[pixelIndex + 1] = Math.max(0, Math.min(1, g)); // G
        image[pixelIndex + 2] = Math.max(0, Math.min(1, b)); // B
      }
    }
    
    return image;
  }

  // Preprocess image region for CNN input
  preprocessImageRegion(canvas, bbox) {
    const [x, y, width, height] = bbox;
    
    // Create a temporary canvas for the test tube region
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set size to CNN input size
    tempCanvas.width = this.inputSize;
    tempCanvas.height = this.inputSize;
    
    // Extract and resize the test tube region
    tempCtx.drawImage(
      canvas, 
      x, y, width, height,  // Source region
      0, 0, this.inputSize, this.inputSize  // Destination size
    );
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, this.inputSize, this.inputSize);
    const data = imageData.data;
    
    // Convert to tensor format [64, 64, 3]
    const tensorData = new Array(this.inputSize * this.inputSize * 3);
    
    // Normalize and arrange as HWC format (Height, Width, Channels)
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        const pixelIndex = (i * this.inputSize + j) * 4; // RGBA format
        const tensorIndex = (i * this.inputSize + j) * 3; // RGB format
        
        // Normalize to [0, 1]
        tensorData[tensorIndex] = data[pixelIndex] / 255.0;     // R
        tensorData[tensorIndex + 1] = data[pixelIndex + 1] / 255.0; // G
        tensorData[tensorIndex + 2] = data[pixelIndex + 2] / 255.0; // B
      }
    }
    
    return tensorData;
  }

  // Main classification method
  async classifyColor(canvas, bbox) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      console.error('❌ CNN model not available');
      return { color: 'unknown', confidence: 0, scores: { blue: 0, purple: 0, other: 0 } };
    }

    console.log('🧠 CNN: Analyzing test tube color with real neural network...');
    
    try {
      // Preprocess the image region
      const tensorData = this.preprocessImageRegion(canvas, bbox);
      
      // Create tensor and add batch dimension
      const inputTensor = tf.tensor4d(tensorData, [1, this.inputSize, this.inputSize, 3]);
      
      // Run CNN inference
      console.log('🧠 Running real CNN inference...');
      const predictions = this.model.predict(inputTensor);
      const predictionData = await predictions.data();
      
      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();
      
      // Get the predicted class
      const maxIndex = predictionData.indexOf(Math.max(...predictionData));
      const confidence = predictionData[maxIndex] * 100;
      const predictedClass = this.classes[maxIndex];
      
      console.log('🧠 Real CNN Prediction:', {
        class: predictedClass,
        confidence: confidence.toFixed(1) + '%',
        scores: {
          blue: (predictionData[0] * 100).toFixed(1) + '%',
          purple: (predictionData[1] * 100).toFixed(1) + '%',
          other: (predictionData[2] * 100).toFixed(1) + '%'
        }
      });
      
      return {
        color: predictedClass,
        confidence: Math.round(confidence),
        scores: {
          blue: Math.round(predictionData[0] * 100),
          purple: Math.round(predictionData[1] * 100),
          other: Math.round(predictionData[2] * 100)
        }
      };
      
    } catch (error) {
      console.error('❌ CNN classification error:', error);
      return {
        color: 'unknown',
        confidence: 0,
        scores: { blue: 0, purple: 0, other: 0 }
      };
    }
  }

  // Get display information for the color
  getColorDisplay(colorResult) {
    const colorMap = {
      blue: { name: 'Blue', color: '#0066CC', emoji: '🔵' },
      purple: { name: 'Purple', color: '#9933CC', emoji: '🟣' },
      other: { name: 'Other', color: '#666666', emoji: '⚫' },
      unknown: { name: 'Unknown', color: '#999999', emoji: '❓' }
    };
    
    return colorMap[colorResult.color] || colorMap.unknown;
  }
}

export default CNNColorClassifier;
