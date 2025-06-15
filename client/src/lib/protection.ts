
// Disable right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
    (e.ctrlKey && e.key === 'u')
  ) {
    e.preventDefault();
  }
  
  // Prevent Ctrl+S
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
  }
  
  // Prevent Ctrl+C on text selection
  if (e.ctrlKey && e.key === 'c' && window.getSelection()?.toString()) {
    e.preventDefault();
  }
});

// Prevent copy/paste
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('paste', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());

// Disable text selection
document.addEventListener('selectstart', (e) => e.preventDefault());

// Add invisible watermark
export const addWatermark = () => {
  const watermark = document.createElement('div');
  watermark.style.position = 'fixed';
  watermark.style.top = '0';
  watermark.style.left = '0';
  watermark.style.width = '100%';
  watermark.style.height = '100%';
  watermark.style.pointerEvents = 'none';
  watermark.style.zIndex = '9999';
  watermark.style.opacity = '0.1';
  watermark.style.userSelect = 'none';
  document.body.appendChild(watermark);
};

// Detect dev tools
export const detectDevTools = () => {
  const devtools = {
    isOpen: false,
    orientation: undefined
  };

  const threshold = 160;

  const emitEvent = (isOpen: boolean, orientation: string) => {
    window.dispatchEvent(new CustomEvent('devtoolschange', {
      detail: {
        isOpen,
        orientation
      }
    }));
  };

  setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    if (
      !(heightThreshold && widthThreshold) &&
      ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
    ) {
      if (!devtools.isOpen || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
      }
      devtools.isOpen = true;
      devtools.orientation = orientation;
    } else {
      if (devtools.isOpen) {
        emitEvent(false, undefined);
      }
      devtools.isOpen = false;
      devtools.orientation = undefined;
    }
  }, 500);

  window.addEventListener('devtoolschange', (e: any) => {
    if (e.detail.isOpen) {
      // Optionally redirect or show warning
      document.body.innerHTML = '<h1>Developer Tools are not allowed on this site.</h1>';
    }
  });
};
