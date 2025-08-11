# Genetics App - Test Tube Detection PWA

A modern Progressive Web App for real-time test tube detection using YOLOv8 and machine learning.

## 🚀 Features

- **Real-time Camera Detection**: Live test tube detection using device camera
- **Image Upload Detection**: Upload and analyze images for test tube detection
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **PWA Support**: Installable as a mobile app with offline capabilities
- **Modern UI/UX**: Smooth animations and consistent design language
- **Export Capabilities**: Download detected images and share via WhatsApp

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **Styling**: Styled Components with responsive design
- **ML Model**: YOLOv8 ONNX model for object detection
- **PWA**: Service Worker for offline functionality
- **Deployment**: Optimized for Vercel

## 📱 Mobile Responsive

- **Breakpoints**: 768px (mobile), 1024px (tablet), 1200px (desktop)
- **Touch-friendly**: Optimized button sizes and spacing
- **Mobile Navigation**: Simplified header for mobile screens
- **Adaptive Layouts**: Grid and card layouts that adapt to screen size

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a React app
   - Deploy with default settings

3. **Custom Domain** (Optional):
   - Add your custom domain in Vercel dashboard
   - Configure DNS settings as instructed

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## 📦 Build Information

- **Bundle Size**: ~210kB (gzipped)
- **Build Output**: Static files in `/build` directory
- **PWA Ready**: Includes service worker and manifest
- **ONNX Models**: ML models included in public/models

## 🔧 Configuration

- **vercel.json**: Optimized routing and headers for deployment
- **package.json**: Build scripts and dependencies
- **manifest.json**: PWA configuration
- **Service Worker**: Offline functionality

## 📊 Performance

- **Mobile Performance**: Optimized for mobile devices
- **Loading Speed**: Optimized bundle size and caching
- **SEO Ready**: Meta tags and proper HTML structure
- **Accessibility**: ARIA labels and keyboard navigation

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Android Chrome
- **PWA Features**: Supported on compatible devices

---

**Ready for Production Deployment** ✅ - Test Tube Detection PWA

A Progressive Web App (PWA) built with React.js for real-time test tube detection using AI/ML.

## Features

- 🔬 **Real-time Detection**: Live camera feed with test tube detection
- 📱 **PWA Support**: Install on mobile devices and use offline
- 📷 **Camera Capture**: Take photos with detection bounding boxes
- 📤 **Image Upload**: Upload and analyze images from device
- 🎯 **High Accuracy**: YOLOv8 model trained specifically for test tubes
- 📊 **Statistics**: Real-time detection stats and confidence scores
- 💾 **Offline Ready**: Works without internet connection

## Technology Stack

- **Frontend**: React.js 18
- **AI/ML**: YOLOv8 + ONNX.js
- **Styling**: Styled Components + CSS
- **Camera**: React Webcam
- **File Upload**: React Dropzone
- **Icons**: React Icons
- **PWA**: Service Worker + Web App Manifest

## Prerequisites

- Node.js 16+ and npm
- Modern browser with camera access
- HTTPS connection (required for camera access)

## Installation

1. **Navigate to the app directory**:
   ```bash
   cd genetics-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   - Go to `http://localhost:3000`
   - For camera access, use `https://localhost:3000` or deploy to HTTPS

## Building for Production

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve the built app**:
   ```bash
   npx serve -s build -l 3000
   ```

## PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Look for the "Install" button in the address bar
3. Click to install as a desktop app

### Mobile
1. Open the app in mobile browser
2. Tap "Add to Home Screen" option
3. The app will be installed as a native-like app

## Usage

### Camera Detection
1. Click "Camera" from the home page
2. Allow camera permissions
3. Click "Start Detection" to begin real-time analysis
4. Click "Capture" to save images with detection boxes
5. Downloaded images include bounding boxes and labels

### Upload Detection
1. Click "Upload" from the home page
2. Drag & drop images or click to select files
3. View detection results with bounding boxes
4. Toggle detection visibility on/off
5. Download processed images or remove uploads

## Model Information

- **Model**: YOLOv8n (nano) optimized for web
- **Input Size**: 416x416 pixels
- **Classes**: test_tube
- **Format**: ONNX (optimized for browser)
- **Performance**: ~30 FPS on modern devices

## File Structure

```
genetics-app/
├── public/
│   ├── models/
│   │   ├── yolov8n_testtube.onnx    # AI model
│   │   └── class_names.json         # Class configuration
│   ├── manifest.json                # PWA manifest
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js               # Navigation header
│   │   ├── Home.js                 # Home page
│   │   ├── CameraDetection.js      # Camera functionality
│   │   └── UploadDetection.js      # Upload functionality
│   ├── utils/
│   │   └── ObjectDetector.js       # AI detection logic
│   ├── App.js                      # Main app component
│   ├── index.js                    # Entry point
│   └── serviceWorkerRegistration.js # PWA service worker
└── package.json
```

## Configuration

### Detection Thresholds
Edit `src/utils/ObjectDetector.js`:
```javascript
this.confidenceThreshold = 0.25;  // Minimum confidence (0-1)
this.iouThreshold = 0.45;         // NMS threshold (0-1)
```

### Model Path
The model is automatically loaded from `/models/yolov8n_testtube.onnx`.
To use a different model, update the path in `ObjectDetector.js`.

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 88+

## Performance Tips

1. **HTTPS**: Required for camera access
2. **Modern Browser**: Use latest browser versions
3. **Good Lighting**: Ensure adequate lighting for detection
4. **Stable Connection**: Initial model loading requires internet

## Troubleshooting

### Camera Not Working
- Ensure HTTPS connection
- Check camera permissions
- Try refreshing the page
- Use a supported browser

### Model Loading Issues
- Check internet connection for initial load
- Verify model files in `/public/models/`
- Check browser console for errors

### Poor Detection Accuracy
- Ensure good lighting conditions
- Position test tubes clearly in view
- Adjust confidence threshold if needed

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Add routes in `App.js`
3. Update navigation in `Header.js`

### Customizing Styling
- Edit styled-components in component files
- Modify global styles in `src/index.css`
- Update theme colors in components

### Model Updates
1. Replace model file in `public/models/`
2. Update class names in `class_names.json`
3. Adjust input dimensions in `ObjectDetector.js` if needed

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are installed correctly
