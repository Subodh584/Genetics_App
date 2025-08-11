import styled, { keyframes, css } from 'styled-components';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Responsive breakpoints
const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px'
};

// Media query helpers
const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`
};

// Shared color palette
const colors = {
  primary: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  secondary: '#6c757d',
  success: '#4CAF50',
  danger: '#ff4444',
  warning: '#FF9800',
  whatsapp: '#25D366',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent'
};

// Common container styles
export const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${slideIn} 0.5s ease-out;

  ${media.mobile} {
    padding: 0.75rem;
  }
`;

export const Title = styled.h2`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 2rem;
  font-weight: 700;

  ${media.mobile} {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

// Consistent button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  ${media.mobile} {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
`;

export const PrimaryButton = styled.button`
  ${baseButtonStyles}
  background: ${colors.primary};
  color: ${colors.white};
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(254, 107, 139, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(254, 107, 139, 0.4);
  }
`;

export const SecondaryButton = styled.button`
  ${baseButtonStyles}
  background: ${colors.secondary};
  color: ${colors.white};
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }
`;

export const DangerButton = styled.button`
  ${baseButtonStyles}
  background: ${colors.danger};
  color: ${colors.white};
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
  }
`;

export const SuccessButton = styled.button`
  ${baseButtonStyles}
  background: ${colors.success};
  color: ${colors.white};
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
  }
`;

// Icon buttons for actions
export const IconButton = styled.button`
  ${baseButtonStyles}
  background: ${props => 
    props.$variant === 'whatsapp' ? colors.whatsapp :
    props.$variant === 'danger' ? colors.danger :
    props.$variant === 'secondary' ? colors.secondary :
    colors.primary
  };
  color: ${colors.white};
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  ${media.mobile} {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

// Small action buttons for cards
export const ActionButton = styled.button`
  ${baseButtonStyles}
  background: ${props => 
    props.$variant === 'danger' ? colors.danger :
    props.$variant === 'secondary' ? colors.secondary :
    colors.primary
  };
  color: ${colors.white};
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  ${media.mobile} {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
`;

// Controls container
export const Controls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  padding: 0 1rem;

  ${media.mobile} {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`;

// Card components
export const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  ${media.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`;

// Grid layouts
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Loading spinner
export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid ${colors.white};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-right: 0.5rem;
`;

// Status indicators
export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => 
    props.$status === 'success' ? colors.success :
    props.$status === 'danger' ? colors.danger :
    props.$status === 'warning' ? colors.warning :
    colors.secondary
  };
  color: ${colors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Mobile responsive camera wrapper
export const CameraWrapper = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  max-width: 100%;

  ${media.mobile} {
    border-radius: 12px;
    margin-bottom: 1.5rem;
    width: 100%;
    
    video, canvas {
      width: 100% !important;
      height: auto !important;
    }
  }
`;

// Error message
export const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  border: 1px solid #ffcdd2;
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.1);
  animation: ${slideIn} 0.3s ease-out;

  ${media.mobile} {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

// Success message
export const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  color: #2e7d32;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  border: 1px solid #c8e6c9;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
  animation: ${slideIn} 0.3s ease-out;

  ${media.mobile} {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

// Dropzone styling
export const DropzoneContainer = styled.div`
  border: 2px dashed ${props => props.$isDragActive ? '#667eea' : '#ccc'};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.$isDragActive ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.$isDragActive ? 
      'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)' : 
      'none'
    };
    animation: ${props => props.$isDragActive ? pulse : 'none'} 2s ease-in-out infinite;
  }

  &:hover {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  ${media.mobile} {
    padding: 2rem 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }
`;

export const DropzoneIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
  position: relative;
  z-index: 1;

  ${media.mobile} {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`;

export const DropzoneText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  font-weight: 500;

  ${media.mobile} {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
`;

export const DropzoneSubtext = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0;
  position: relative;
  z-index: 1;

  ${media.mobile} {
    font-size: 0.8rem;
  }
`;

// Export media queries and colors for use in other components
export { media, colors, breakpoints };
