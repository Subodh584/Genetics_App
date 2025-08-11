import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaFlask, FaCamera, FaUpload, FaHome } from 'react-icons/fa';
import { media } from './shared/UIComponents';
import logo from '../assets/logo.png';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  ${media.mobile} {
    padding: 0.75rem 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media.mobile} {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  img {
    height: 40px;
    width: auto;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1) rotate(5deg);
  }

  ${media.mobile} {
    font-size: 1.25rem;
    
    img {
      height: 32px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.5rem;

  ${media.mobile} {
    gap: 0.25rem;
    width: 100%;
    justify-content: center;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  
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
  
  ${props => props.$active && `
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  ${media.mobile} {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    flex: 1;
    justify-content: center;
    
    span {
      display: none;
    }
  }

  svg {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.2);
  }

  ${media.mobile} {
    svg {
      font-size: 1.2rem;
    }
  }
`;

const NavText = styled.span`
  ${media.mobile} {
    display: none;
  }
`;

const Header = () => {
  const location = useLocation();

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <img src={logo} alt="Genetics App Logo" />
          Genetics App
        </Logo>
        <Nav>
          <NavLink to="/" $active={location.pathname === '/'}>
            <FaHome />
            <NavText>Home</NavText>
          </NavLink>
          <NavLink to="/camera" $active={location.pathname === '/camera'}>
            <FaCamera />
            <NavText>Camera</NavText>
          </NavLink>
          <NavLink to="/upload" $active={location.pathname === '/upload'}>
            <FaUpload />
            <NavText>Upload</NavText>
          </NavLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
