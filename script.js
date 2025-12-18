document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('stars');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const enterOverlay = document.getElementById('enter-overlay');
  const enterBtn = document.getElementById('enter-btn');
  const audio = document.getElementById('bg-audio');
  const playBtn = document.getElementById('play-btn');
  const progressEl = document.getElementById('progress');
  const timeEl = document.getElementById('time');
  const volumeEl = document.getElementById('volume');
  const profile = document.getElementById('profile');
  const bgVideo = document.getElementById('bg-video');

  // Ensure background video plays properly
  if (bgVideo) {
    bgVideo.addEventListener('loadeddata', () => {
      console.log('Background video loaded successfully');
      bgVideo.play().catch(err => console.log('Video autoplay blocked:', err));
    });
    
    bgVideo.addEventListener('error', (e) => {
      console.warn('Background video failed to load:', e);
      // Video failed, stars will be more visible as fallback
    });

    // Force video to load
    bgVideo.load();
  }

  // Utility: format time
  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
  }

  // Typewriter animation function that goes back and forth
  function typeWriterLoop(element, text, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
    let isTyping = true;
    let currentText = '';
    let charIndex = 0;

    function animate() {
      if (isTyping) {
        // Typing phase
        if (charIndex < text.length) {
          currentText += text.charAt(charIndex);
          element.textContent = currentText;
          charIndex++;
          setTimeout(animate, typeSpeed);
        } else {
          // Pause before deleting
          setTimeout(() => {
            isTyping = false;
            animate();
          }, pauseTime);
        }
      } else {
        // Deleting phase
        if (charIndex > 0) {
          currentText = currentText.slice(0, -1);
          element.textContent = currentText;
          charIndex--;
          setTimeout(animate, deleteSpeed);
        } else {
          // Pause before typing again
          setTimeout(() => {
            isTyping = true;
            animate();
          }, 500);
        }
      }
    }
    animate();
  }

  // Tab title typewriter animation that loops
  function typeWriterTitleLoop(text, typeSpeed = 150, deleteSpeed = 75, pauseTime = 3000) {
    let isTyping = true;
    let currentText = '';
    let charIndex = 0;

    function animate() {
      if (isTyping) {
        // Typing phase
        if (charIndex < text.length) {
          currentText += text.charAt(charIndex);
          document.title = currentText;
          charIndex++;
          setTimeout(animate, typeSpeed);
        } else {
          // Pause before deleting
          setTimeout(() => {
            isTyping = false;
            animate();
          }, pauseTime);
        }
      } else {
        // Deleting phase
        if (charIndex > 0) {
          currentText = currentText.slice(0, -1);
          document.title = currentText;
          charIndex--;
          setTimeout(animate, deleteSpeed);
        } else {
          // Pause before typing again
          setTimeout(() => {
            isTyping = true;
            animate();
          }, 1000);
        }
      }
    }
    animate();
  }

  // Clean enter behavior: hide overlay and start audio only on explicit user gesture
  function enterSite() {
    console.log('enterSite called');
    document.body.classList.remove('overlay-open');
    if (enterOverlay) {
      enterOverlay.classList.add('hidden');
      setTimeout(() => {
        if (enterOverlay && enterOverlay.parentNode) {
          enterOverlay.parentNode.removeChild(enterOverlay);
        }
      }, 600);
    }
    if (audio) {
      audio.play().then(() => {
        console.log('audio playing');
      }).catch((err) => {
        console.warn('audio play blocked', err);
      });
    }

    // Start typewriter animations after overlay fades
    setTimeout(() => {
      // Animate tab title (loops forever)
      typeWriterTitleLoop('King CK', 120, 60, 2500);
      
      // Animate name on page (loops forever)
      const nameElement = document.querySelector('.name');
      if (nameElement) {
        typeWriterLoop(nameElement, 'RealCk', 150, 75, 2000);
      }
    }, 700);
  }

  // Wire overlay button and overlay clicks
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterSite();
    });
  }
  if (enterOverlay) {
    enterOverlay.addEventListener('click', (e) => {
      if (e.target === enterOverlay) enterSite();
    });
  }
  // keyboard
  window.addEventListener('keydown', (e) => {
    if (enterOverlay) enterSite();
  }, { once: true });

  // Audio controls
  if (audio) {
    audio.volume = volumeEl ? Number(volumeEl.value) : 0.6;
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (audio.paused) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      });
    }
    audio.addEventListener('timeupdate', () => {
      if (progressEl) {
        progressEl.style.width = (audio.currentTime / (audio.duration || 1) * 100) + '%';
      }
      if (timeEl) {
        timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      if (timeEl) {
        timeEl.textContent = `${formatTime(0)} / ${formatTime(audio.duration)}`;
      }
    });
    audio.addEventListener('play', () => {
      if (playBtn) playBtn.textContent = '❚❚';
    });
    audio.addEventListener('pause', () => {
      if (playBtn) playBtn.textContent = '►';
    });
    if (volumeEl) {
      volumeEl.addEventListener('input', () => {
        audio.volume = Number(volumeEl.value);
      });
    }
  }

  // Starfield (minimal, safe if canvas missing)
  if (ctx && canvas) {
    let width = 0, height = 0, stars = [];
    
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    }
    
    function initStars() {
      stars = [];
      const density = Math.max(40, Math.floor(window.innerWidth / 22));
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 1.6 + 0.3,
          r: Math.random() * 2.2 + 0.4,
          tw: Math.random() * 1.6
        });
      }
    }
    
    let t = 0;
    function frame() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, 'rgba(0,0,0,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (const s of stars) {
        const tw = Math.sin(t * 2 + s.tw) * 0.5 + 0.5;
        const a = 0.4 * tw + 0.45 * (1 / s.z);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.arc(s.x / s.z, s.y / s.z, s.r / s.z * (1 + 0.5 * tw), 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    
    // gentle slow drift to give life
    setInterval(() => {
      for (const s of stars) {
        s.x += (Math.random() - 0.5) * 0.6;
        s.y += (Math.random() - 0.5) * 0.6;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      }
    }, 800);
    
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
  }

  // Parallax/profile tilt
  if (profile) {
    let lastX = 0, lastY = 0;
    function onMove(e) {
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - window.innerWidth / 2;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - window.innerHeight / 2;
      const rx = (y / window.innerHeight) * 6;
      const ry = (x / window.innerWidth) * -6;
      profile.style.transform = `translate3d(${ry}px,${-rx}px,0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      lastX = x;
      lastY = y;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    // small hover float on profile
    let hover = false;
    profile.addEventListener('mouseenter', () => {
      hover = true;
      profile.style.transition = 'transform 0.08s ease-out';
    });
    profile.addEventListener('mouseleave', () => {
      hover = false;
      profile.style.transition = 'transform 0.28s cubic-bezier(.2,.9,.3,1)';
      profile.style.transform = 'translate3d(0,0,0)';
    });

    // accessibility: reduce motion respect
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      window.removeEventListener('mousemove', onMove);
      profile.style.transform = 'none';
    }
  }

  // Generate unique visitor ID based on browser fingerprint
  function generateVisitorId() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Visitor fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Real view counter with unique visitor tracking
  function updateViewCount() {
    const viewCountEl = document.getElementById('view-count');
    console.log('View count element:', viewCountEl);
    
    if (!viewCountEl) {
      console.error('View count element not found!');
      return;
    }

    // Generate unique visitor ID
    const visitorId = generateVisitorId();
    
    // Get list of visitors who have already been counted
    let countedVisitors = localStorage.getItem('portfolio-counted-visitors');
    if (!countedVisitors) {
      countedVisitors = [];
    } else {
      countedVisitors = JSON.parse(countedVisitors);
    }
    
    // Get current view count
    let viewCount = localStorage.getItem('portfolio-views');
    if (!viewCount) {
      viewCount = 0;
    } else {
      viewCount = parseInt(viewCount);
    }
    
    // Only increment if this visitor hasn't been counted before
    if (!countedVisitors.includes(visitorId)) {
      viewCount++;
      countedVisitors.push(visitorId);
      
      // Save updated data
      localStorage.setItem('portfolio-views', viewCount);
      localStorage.setItem('portfolio-counted-visitors', JSON.stringify(countedVisitors));
      
      console.log('New unique visitor! Updated view count to:', viewCount);
    } else {
      console.log('Returning visitor, view count stays at:', viewCount);
    }
    
    // Display the count
    viewCountEl.textContent = viewCount.toLocaleString();
  }

  // Update view count immediately when page loads
  updateViewCount();

  // Expose for debugging (optional)
  window.__enterSite = enterSite;
  console.log('page script initialized');
});