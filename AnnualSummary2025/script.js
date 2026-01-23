document.addEventListener('DOMContentLoaded', function() {
    
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    document.addEventListener('DOMContentLoaded', animateCounters);
    function animateCounters() {
    const counterElements = document.querySelectorAll('.stat-value');
    console.log(`[计数器] 找到 ${counterElements.length} 个元素`);

    if (counterElements.length === 0) return;

    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    
    function animateValue(element, start, end, duration) {
        let startTime = null;

        const animationFrame = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            
            const easedProgress = easeOutQuart(progress);
            const currentValue = Math.floor(easedProgress * (end - start) + start);
            
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            } else {
                element.textContent = end.toLocaleString(); 
                element.classList.add('counted'); 
            }
        };
        
        requestAnimationFrame(animationFrame);
    }

    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.getAttribute('data-count'), 10);
                const startValue = parseInt(element.getAttribute('data-start'), 10) || 0;
                
                if (!isNaN(targetValue)) {
                    console.log(`[计数器] 开始动画: ${startValue} → ${targetValue}`);
                    
                    
                    element.textContent = startValue.toLocaleString();
                    element.classList.add('animating');
                    
                    
                    const change = Math.abs(targetValue - startValue);
                    const duration = change > 1000 ? 1800 : 2000;
                    
                    
                    animateValue(element, startValue, targetValue, duration);
                } else {
                    
                    element.textContent = startValue.toLocaleString();
                }
                
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    
    counterElements.forEach(element => {
        
        const startValue = parseInt(element.getAttribute('data-start'), 10) || 0;
        const targetValue = parseInt(element.getAttribute('data-count'), 10);
        
        
        if (!element.hasAttribute('data-start')) {
            const currentText = element.textContent.trim();
            const currentValue = parseInt(currentText.replace(/,/g, ''), 10);
            if (!isNaN(currentValue)) {
                element.setAttribute('data-start', currentValue);
            } else {
                element.setAttribute('data-start', '0');
            }
        }
        
        
        element.textContent = startValue.toLocaleString();
        
        
        observer.observe(element);
    });
    }



   function initChart(config) {
        
        const defaultConfig = {
            canvasId: 'gradeChart',
            labels: ['3', '4', '5','5.5', '6', '6.5', '9', '10', '11', '12','1'],
            datasetLabel: '自我感觉成绩相对变化',
            data: [0.5, 0.6, 0.25, 0.8, 0.84, 0.5, 0.7, 0.8, 0.8, 0.85, 0.9],
            borderColor: '#4a6fa5',
            backgroundColor: 'rgba(74, 111, 165, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            min: 0.0,
            max: 1.0,
            responsive: true,
            legendFontSize: 14,
            gridColor: 'rgba(0, 0, 0, 0.05)'
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        const ctx = document.getElementById(finalConfig.canvasId).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: finalConfig.labels,
                datasets: [{
                    label: finalConfig.datasetLabel,
                    data: finalConfig.data,
                    borderColor: finalConfig.borderColor,
                    backgroundColor: finalConfig.backgroundColor,
                    borderWidth: finalConfig.borderWidth,
                    fill: finalConfig.fill,
                    tension: finalConfig.tension
                }]
            },
            options: {
                responsive: finalConfig.responsive,
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: finalConfig.legendFontSize
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: finalConfig.min,
                        max: finalConfig.max,
                        grid: {
                            color: finalConfig.gridColor
                        }
                    },
                    x: {
                        grid: {
                            color: finalConfig.gridColor
                        }
                    }
                }
            }
        });
    }

    function initMap() {
        const map = L.map('map');
        const tileLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: ['1', '2', '3', '4'],
            attribution: '© 高德地图',
            maxZoom: 18,
            minZoom: 3,
            reuseTiles: true,
            updateWhenIdle: true 
        }).addTo(map);

        map.setView([39.874447,116.317000], 5);

        const locations = [
            { name: "家", coords: [43.204527,123.727131] },
            { name: "沈阳", coords: [41.796767,123.429096] },
            { name: "昌图", coords: [42.770887,124.106044] },
            
        ];

        locations.forEach(loc => {
            L.marker(loc.coords)
                .addTo(map)
                .bindPopup(`<b>${loc.name}</b><br>2025年到访`);
        });
    }

    
    function updateCountdown() {
        const springFestival = new Date('2026-02-16').getTime();
        const now = new Date().getTime();
        const diff = springFestival - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (diff > 0) {
            document.getElementById('countdown-timer').innerHTML = 
                `还剩${days}天 ${hours}小时 ${minutes}分钟`;
        } else {
            document.getElementById('countdown-timer').innerHTML = `已过${-days}天 ${-hours}小时 ${-minutes}分钟`;
        }
    }
    // 图片点击放大功能
    function initImageZoom() {
        // 检查是否已经存在模态框
        if (document.querySelector('.image-modal')) {
            console.log('图片放大功能已初始化');
            return;
        }
        
        // 创建模态框容器
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        // 创建图片容器
        const imgContainer = document.createElement('div');
        imgContainer.className = 'modal-image-container';
        
        // 创建图片元素
        const modalImg = document.createElement('img');
        modalImg.className = 'modal-image';
        
        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', '关闭');
        
        // 创建导航按钮
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '‹';
        prevBtn.className = 'modal-nav modal-prev';
        prevBtn.setAttribute('aria-label', '上一张');
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '›';
        nextBtn.className = 'modal-nav modal-next';
        nextBtn.setAttribute('aria-label', '下一张');
        
        // 创建图片描述
        const caption = document.createElement('div');
        caption.className = 'modal-caption';
        
        // 组装模态框
        imgContainer.appendChild(modalImg);
        imgContainer.appendChild(closeBtn);
        imgContainer.appendChild(prevBtn);
        imgContainer.appendChild(nextBtn);
        imgContainer.appendChild(caption);
        modal.appendChild(imgContainer);
        document.body.appendChild(modal);
        
        // 图片数组和当前索引
        let currentImages = [];
        let currentIndex = 0;
        
        // 打开模态框
        function openModal(images, index = 0) {
            currentImages = images;
            currentIndex = index;
            updateModal();
            
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // 显示/隐藏导航按钮
            prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
            nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
            
            // 阻止背景滚动
            document.body.style.overflow = 'hidden';
        }
        
        // 关闭模态框
        function closeModal() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
        
        // 更新模态框内容
        function updateModal() {
            const imgData = currentImages[currentIndex];
            modalImg.src = imgData.src;
            modalImg.alt = imgData.alt || '';
            caption.textContent = imgData.caption || '';
            
            // 预加载相邻图片
            preloadAdjacentImages();
        }
        
        // 预加载相邻图片
        function preloadAdjacentImages() {
            const indicesToPreload = [
                (currentIndex - 1 + currentImages.length) % currentImages.length,
                (currentIndex + 1) % currentImages.length
            ];
            
            indicesToPreload.forEach(index => {
                const img = new Image();
                img.src = currentImages[index].src;
            });
        }
        
        // 导航到上一张
        function prevImage() {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            updateModal();
        }
        
        // 导航到下一张
        function nextImage() {
            currentIndex = (currentIndex + 1) % currentImages.length;
            updateModal();
        }
        
        // 事件监听器
        closeBtn.addEventListener('click', closeModal);
        prevBtn.addEventListener('click', prevImage);
        nextBtn.addEventListener('click', nextImage);
        
        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'flex') {
                switch(e.key) {
                    case 'Escape':
                        closeModal();
                        break;
                    case 'ArrowLeft':
                        prevImage();
                        break;
                    case 'ArrowRight':
                        nextImage();
                        break;
                }
            }
        });
        
        // 为所有可放大的图片添加点击事件
        function attachImageZoomEvents() {
            document.querySelectorAll('.zoomable-image').forEach((img, index, arr) => {
                // 移除可能存在的旧事件监听器
                img.removeEventListener('click', handleImageClick);
                
                // 添加新的事件监听器
                img.addEventListener('click', handleImageClick);
                
                function handleImageClick() {
                    // 收集所有可放大的图片数据
                    const images = Array.from(arr).map(image => ({
                        src: image.src,
                        alt: image.alt,
                        caption: image.getAttribute('data-caption') || image.getAttribute('alt') || ''
                    }));
                    
                    // 获取当前点击图片的索引
                    const clickedIndex = Array.from(arr).indexOf(this);
                    openModal(images, clickedIndex);
                }
            });
        }
        
        // 初始化时添加事件
        attachImageZoomEvents();
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    
    animateCounters();
    initChart({
        canvasId: 'gradeChart',
        labels: ['3', '4', '5','5.5', '6', '6.5', '9', '10', '11', '12','1'],
        datasetLabel: '自我感觉成绩相对变化',
        data: [0.5, 0.6, 0.25, 0.8, 0.84, 0.5, 0.7, 0.8, 0.8, 0.85, 0.9],
        min: 0.0,
        max: 1.0,
    });
    initChart({
        canvasId: 'bilibiliChart',
        labels: ['1', '2', '3','4', '5', '6', '7', '8', '9', '10','11','12'],
        datasetLabel: '投稿数',
        data: [0, 4, 0, 0, 0, 1, 2, 1, 0, 1, 0],
        min: 0,
        max: 5,
    });
    initMap();
    updateCountdown();
    
    
    setInterval(updateCountdown, 60000);
});