import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaCamera, FaUpload, FaFlask, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Container, Title, Card, media } from './shared/UIComponents';

const HomeContainer = styled(Container)`
  text-align: center;
  padding: 2rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${media.mobile} {
    padding: 1rem;
    min-height: calc(100vh - 100px);
  }
`;

const MainTitle = styled.h1`
  color: white;
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  font-weight: 800;
  background: linear-gradient(45deg, #FE6B8B, #FF8E53, #667eea);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  ${media.mobile} {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
  line-height: 1.6;

  ${media.mobile} {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto 3rem auto;

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const OptionCard = styled(Card).attrs({ as: Link })`
  padding: 2.5rem;
  text-decoration: none;
  color: #333;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.6s;
  }

  &:hover:before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }

  ${media.mobile} {
    padding: 2rem 1.5rem;
    
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
`;

const OptionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #667eea;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  ${media.mobile} {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const OptionTitle = styled.h3`
  font-size: 1.6rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 700;
  position: relative;
  z-index: 1;

  ${media.mobile} {
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
  }
`;

const OptionDescription = styled.p`
  color: #666;
  line-height: 1.7;
  font-size: 1rem;
  position: relative;
  z-index: 1;

  ${media.mobile} {
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

const StatusContainer = styled(Card)`
  margin: 2rem auto;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;

  ${media.mobile} {
    margin: 1.5rem auto;
    padding: 1.25rem;
  }
`;

const StatusTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);

  ${media.mobile} {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  
  svg {
    color: ${props => props.$status === 'success' ? '#4CAF50' : 
                      props.$status === 'error' ? '#ff4444' : '#FF9800'};
    font-size: 1.2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  ${media.mobile} {
    font-size: 0.9rem;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    
    svg {
      font-size: 1.1rem;
    }
  }
`;

const Home = ({ isModelLoaded, modelError }) => {
  return (
    <HomeContainer>
      <MainTitle>
        <FaFlask style={{ marginRight: '1rem', color: '#667eea' }} />
        Genetics App
      </MainTitle>
      <Subtitle>
        Real-time test tube detection powered by AI. 
        Capture images or upload files for instant analysis with advanced color detection.
      </Subtitle>

      <StatusContainer>
        <StatusTitle>System Status</StatusTitle>
        <StatusItem $status={isModelLoaded ? 'success' : 'loading'}>
          {isModelLoaded ? <FaCheckCircle /> : <FaExclamationTriangle />}
          AI Model: {isModelLoaded ? 'Ready for Detection' : 'Loading Model...'}
        </StatusItem>
        {modelError && (
          <StatusItem $status="error">
            <FaExclamationTriangle />
            Error: {modelError}
          </StatusItem>
        )}
      </StatusContainer>

      <OptionsContainer>
        <OptionCard to="/camera">
          <OptionIcon>
            <FaCamera />
          </OptionIcon>
          <OptionTitle>Camera Detection</OptionTitle>
          <OptionDescription>
            Use your device camera for real-time test tube detection. 
            Capture images with bounding boxes and color analysis. Download and share results instantly.
          </OptionDescription>
        </OptionCard>

        <OptionCard to="/upload">
          <OptionIcon>
            <FaUpload />
          </OptionIcon>
          <OptionTitle>Upload & Analyze</OptionTitle>
          <OptionDescription>
            Upload images from your device for batch analysis. 
            Preview results with detection boxes, manage uploads, and export all results.
          </OptionDescription>
        </OptionCard>
      </OptionsContainer>
    </HomeContainer>
  );
};

export default Home;
