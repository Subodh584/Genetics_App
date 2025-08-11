class ColorAnalyzer {
  constructor() {
    this.colors = {
      // Improved HSV ranges for better blue detection
      blue: { h: [190, 250], s: [25, 100], v: [25, 100] },
      lightBlue: { h: [170, 210], s: [15, 70], v: [35, 100] },
      
      // Improved HSV ranges for better purple detection  
      purple: { h: [260, 320], s: [25, 100], v: [20, 100] },
      darkPurple: { h: [240, 280], s: [20, 100], v: [15, 90] }
    };
  }

  // Convert RGB to HSV for better color analysis
  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round(max * 100);

    return { h, s, v };
  }

  // Analyze the dominant color in a test tube region
  analyzeTestTubeColor(canvas, bbox) {
    const [x, y, width, height] = bbox;
    
    // Create a temporary canvas to extract the region
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set size to the bounding box region
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Draw the specific region
    tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    
    // Get image data from the center region (avoid edges)
    const centerX = Math.floor(width * 0.3);
    const centerY = Math.floor(height * 0.3);
    const centerWidth = Math.floor(width * 0.4);
    const centerHeight = Math.floor(height * 0.4);
    
    const imageData = tempCtx.getImageData(centerX, centerY, centerWidth, centerHeight);
    const data = imageData.data;
    
    console.log(`🎨 Analyzing color in region: ${centerWidth}x${centerHeight} pixels`);
    
    // Sample pixels and analyze colors
    const colorCounts = {
      blue: 0,
      purple: 0,
      lightBlue: 0,
      darkPurple: 0,
      other: 0
    };
    
    const totalPixels = (centerWidth * centerHeight);
    const sampleRate = Math.max(1, Math.floor(totalPixels / 1000)); // Sample up to 1000 pixels
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      const hsv = this.rgbToHsv(r, g, b);
      const colorType = this.classifyColor(hsv);
      colorCounts[colorType]++;
    }
    
    console.log('🎨 Color analysis results:', colorCounts);
    
    // Determine dominant color
    const dominantColor = this.getDominantColor(colorCounts);
    const confidence = this.calculateConfidence(colorCounts, dominantColor);
    
    return {
      color: dominantColor,
      confidence: confidence,
      details: colorCounts
    };
  }

  classifyColor(hsv) {
    const { h, s, v } = hsv;
    
    // Check for blue variations
    if (this.isInRange(h, this.colors.blue.h) && 
        this.isInRange(s, this.colors.blue.s) && 
        this.isInRange(v, this.colors.blue.v)) {
      return 'blue';
    }
    
    if (this.isInRange(h, this.colors.lightBlue.h) && 
        this.isInRange(s, this.colors.lightBlue.s) && 
        this.isInRange(v, this.colors.lightBlue.v)) {
      return 'lightBlue';
    }
    
    // Check for purple variations
    if (this.isInRange(h, this.colors.purple.h) && 
        this.isInRange(s, this.colors.purple.s) && 
        this.isInRange(v, this.colors.purple.v)) {
      return 'purple';
    }
    
    if (this.isInRange(h, this.colors.darkPurple.h) && 
        this.isInRange(s, this.colors.darkPurple.s) && 
        this.isInRange(v, this.colors.darkPurple.v)) {
      return 'darkPurple';
    }
    
    return 'other';
  }

  isInRange(value, range) {
    return value >= range[0] && value <= range[1];
  }

  getDominantColor(colorCounts) {
    // Combine blue variants
    const totalBlue = colorCounts.blue + colorCounts.lightBlue;
    const totalPurple = colorCounts.purple + colorCounts.darkPurple;
    
    // Always return either blue or purple (whichever is higher)
    // If neither is detected well, default to blue
    if (totalBlue >= totalPurple) {
      return 'blue';
    } else {
      return 'purple';
    }
  }

  calculateConfidence(colorCounts, dominantColor) {
    const total = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 50; // Default confidence if no color detected
    
    let dominantCount = 0;
    if (dominantColor === 'blue') {
      dominantCount = colorCounts.blue + colorCounts.lightBlue;
    } else if (dominantColor === 'purple') {
      dominantCount = colorCounts.purple + colorCounts.darkPurple;
    }
    
    // Ensure minimum confidence of 30% for any result
    const confidence = Math.max(30, Math.round((dominantCount / total) * 100));
    return Math.min(100, confidence);
  }

  // Get color for display
  getColorDisplay(colorResult) {
    const colorMap = {
      blue: { name: 'Blue', color: '#0066CC', emoji: '🔵' },
      purple: { name: 'Purple', color: '#9933CC', emoji: '🟣' }
    };
    
    // Always return either blue or purple
    return colorMap[colorResult.color] || colorMap.blue;
  }
}

export default ColorAnalyzer;
