(function() {
  const banner = document.querySelector('.hero-banner');
  const bgLayer = document.querySelector('.hero-bg-layer');
  if (!banner || !bgLayer) return;

  const images = [
    '/images/hero1.png',
    '/images/hero2.png',
    '/images/hero3.png'
  ];
  const interval = 5000;  // 5 秒换一张
  let currentIndex = 0;
  let preloaded = [];     // 预加载的 Image 对象

  // 预加载全部图片
  images.forEach((url, i) => {
    const img = new Image();
    img.src = url;
    preloaded.push(img);
  });

  // 设置当前图片（直接显示，不透明）
  bgLayer.style.backgroundImage = `url('${images[0]}')`;
  bgLayer.style.opacity = 1;

  function transitionToNext() {
    const nextIndex = (currentIndex + 1) % images.length;
    const nextUrl = images[nextIndex];

    // 创建一个临时层用于淡入
    const nextLayer = bgLayer.cloneNode();
    nextLayer.style.backgroundImage = `url('${nextUrl}')`;
    nextLayer.style.opacity = 0;
    nextLayer.classList.add('hero-bg-layer'); // 确保样式一致
    banner.appendChild(nextLayer);

    // 强制回流，让浏览器识别新层的初始 opacity: 0
    void nextLayer.offsetWidth;

    // 开始淡入新层，同时淡出旧层
    nextLayer.style.transition = 'opacity 1s ease-in-out';
    nextLayer.style.opacity = 1;
    bgLayer.style.opacity = 0;

    // 过渡结束后移除旧层，新层成为当前层
    nextLayer.addEventListener('transitionend', function handler() {
      bgLayer.remove();
      nextLayer.removeEventListener('transitionend', handler);
      // 更新引用，新层变为下一次的旧层
      window.bgLayer = nextLayer;
      currentIndex = nextIndex;
    }, { once: true });

    // 更新全局引用，供下次使用
    bgLayer = nextLayer;
  }

  // 先设好引用
  window.bgLayer = bgLayer;
  setInterval(transitionToNext, interval);
})();