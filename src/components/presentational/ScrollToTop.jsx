import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the pathname changes, instantly scroll to the top left
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component works entirely in the background; it renders no UI
};

export default ScrollToTop;