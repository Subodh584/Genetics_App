import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './components/Home';
import CameraDetection from './components/CameraDetection';
import UploadDetection from './components/UploadDetection';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);

  return (
    <Router>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  isModelLoaded={isModelLoaded}
                  modelError={modelError}
                />
              } 
            />
            <Route 
              path="/camera" 
              element={
                <CameraDetection 
                  isModelLoaded={isModelLoaded}
                  setIsModelLoaded={setIsModelLoaded}
                  setModelError={setModelError}
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <UploadDetection 
                  isModelLoaded={isModelLoaded}
                  setIsModelLoaded={setIsModelLoaded}
                  setModelError={setModelError}
                />
              } 
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
