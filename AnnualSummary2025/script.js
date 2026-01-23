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
    // 图片查看器功能（类似评论区样式）
    function initImageViewer() {
        // 检查是否已存在查看器
        if (document.getElementById('imageViewerOverlay')) {
            return;
        }
        
        // 创建查看器结构
        const overlay = document.createElement('div');
        overlay.id = 'imageViewerOverlay';
        overlay.className = 'image-viewer-overlay';
        
        const container = document.createElement('div');
        container.className = 'image-viewer-container';
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-viewer-img-container';
        
        const img = document.createElement('img');
        img.className = 'image-viewer-img';
        
        // 创建工具栏
        const toolbar = document.createElement('div');
        toolbar.className = 'image-viewer-toolbar';
        
        const zoomInBtn = createButton('+', 'zoom-in', '放大');
        const zoomOutBtn = createButton('-', 'zoom-out', '缩小');
        const closeBtn = createButton('×', 'close', '关闭');
        
        // 创建信息显示
        const zoomLevel = document.createElement('div');
        zoomLevel.className = 'image-viewer-zoom-level';
        zoomLevel.textContent = '100%';
        
        const info = document.createElement('div');
        info.className = 'image-viewer-info';
        
        const counter = document.createElement('div');
        counter.className = 'image-viewer-counter';
        
        const filename = document.createElement('div');
        filename.className = 'image-viewer-filename';
        
        info.appendChild(counter);
        info.appendChild(filename);
        
        // 创建加载提示
        const loading = document.createElement('div');
        loading.className = 'image-loading';
        loading.textContent = '加载中...';
        loading.style.display = 'none';
        
        // 组装结构
        toolbar.appendChild(zoomInBtn);
        toolbar.appendChild(zoomOutBtn);
        toolbar.appendChild(closeBtn);
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(loading);
        
        container.appendChild(zoomLevel);
        container.appendChild(toolbar);
        container.appendChild(imgContainer);
        container.appendChild(info);
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // 状态变量
        let currentImages = [];
        let currentIndex = 0;
        let scale = 1;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let translateX = 0;
        let translateY = 0;
        
        // 创建按钮的辅助函数
        function createButton(text, className, title) {
            const btn = document.createElement('button');
            btn.className = `image-viewer-btn ${className}`;
            btn.innerHTML = text;
            btn.title = title;
            return btn;
        }
        
        // 打开查看器
        function openViewer(images, index = 0) {
            currentImages = images;
            currentIndex = index;
            
            // 重置状态
            resetTransform();
            
            // 显示查看器
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 10);
            
            // 加载图片
            loadImage(currentIndex);
        }
        
        // 关闭查看器
        function closeViewer() {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
        
        // 加载图片
        function loadImage(index) {
            if (index < 0 || index >= currentImages.length) return;
            
            const imgData = currentImages[index];
            currentIndex = index;
            
            // 显示加载提示
            loading.style.display = 'block';
            img.style.opacity = '0';
            
            // 创建新Image对象预加载
            const tempImg = new Image();
            tempImg.onload = function() {
                img.src = this.src;
                img.alt = imgData.alt || '';
                img.style.opacity = '1';
                loading.style.display = 'none';
                
                // 更新信息
                updateInfo();
            };
            
            tempImg.onerror = function() {
                loading.textContent = '图片加载失败';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 2000);
            };
            
            tempImg.src = imgData.src;
        }
        
        // 更新显示信息
        function updateInfo() {
            counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
            
            const imgData = currentImages[currentIndex];
            const name = imgData.alt || imgData.caption || '图片';
            filename.textContent = name;
            
            zoomLevel.textContent = `${Math.round(scale * 100)}%`;
        }
        
        // 重置变换
        function resetTransform() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            applyTransform();
        }
        
        // 应用变换
        function applyTransform() {
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            updateInfo();
        }
        
        // 缩放图片
        function zoomIn() {
            if (scale < 5) {
                scale += 0.25;
                applyTransform();
            }
        }
        
        function zoomOut() {
            if (scale > 0.25) {
                scale -= 0.25;
                applyTransform();
            }
        }
        
        // 鼠标滚轮缩放
        function handleWheel(e) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
        
        // 鼠标拖动
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            img.classList.add('dragging');
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        }
        
        function doDrag(e) {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            applyTransform();
        }
        
        function endDrag() {
            isDragging = false;
            img.classList.remove('dragging');
        }
        
        // 键盘控制
        function handleKeyDown(e) {
            if (!overlay.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    closeViewer();
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        loadImage(currentIndex - 1);
                    }
                    break;
                case 'ArrowRight':
                    if (currentIndex < currentImages.length - 1) {
                        loadImage(currentIndex + 1);
                    }
                    break;
                case '+':
                case '=':
                    if (e.shiftKey || e.key === '+') {
                        zoomIn();
                    }
                    break;
                case '-':
                    zoomOut();
                    break;
                case '0':
                    resetTransform();
                    break;
            }
        }
        
        // 双击重置
        function handleDoubleClick() {
            resetTransform();
        }
        
        // 绑定事件
        closeBtn.addEventListener('click', closeViewer);
        zoomInBtn.addEventListener('click', zoomIn);
        zoomOutBtn.addEventListener('click', zoomOut);
        img.addEventListener('wheel', handleWheel);
        img.addEventListener('mousedown', startDrag);
        img.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag({
                preventDefault: () => {},
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        img.addEventListener('dblclick', handleDoubleClick);
        
        window.addEventListener('mousemove', doDrag);
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            doDrag({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
        document.addEventListener('keydown', handleKeyDown);
        
        // 点击背景关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeViewer();
            }
        });
        
        // 为所有可点击图片添加事件
        function attachImageEvents() {
            document.querySelectorAll('.clickable-image').forEach((img, index, arr) => {
                // 移除旧事件监听器
                img.removeEventListener('click', handleImageClick);
                
                // 添加新事件监听器
                img.addEventListener('click', function() {
                    const images = Array.from(arr).map(image => ({
                        src: image.src,
                        alt: image.alt,
                        caption: image.getAttribute('data-caption') || image.getAttribute('alt') || ''
                    }));
                    
                    const clickedIndex = Array.from(arr).indexOf(this);
                    openViewer(images, clickedIndex);
                });
            });
        }
        
        // 初始化事件绑定
        attachImageEvents();
        
        // 监听动态添加的图片
        const observer = new MutationObserver(() => {
            attachImageEvents();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
    initImageViewer();
    
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