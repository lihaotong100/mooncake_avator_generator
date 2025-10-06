// 全局变量
let uploadedImage = null;
let currentFrame = 'moon';
let canvas, ctx;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    const uploadBox = document.getElementById('uploadBox');
    const imageInput = document.getElementById('imageInput');
    
    // 点击上传
    uploadBox.addEventListener('click', () => imageInput.click());
    
    // 文件选择
    imageInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    // 框架选择
    document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFrame = this.dataset.frame;
            renderCanvas();
        });
    });
    
    // 文字控制
    document.getElementById('addText').addEventListener('change', renderCanvas);
    document.getElementById('customText').addEventListener('input', renderCanvas);
    
    // 滑块控制
    document.getElementById('roundness').addEventListener('input', function() {
        document.getElementById('roundnessValue').textContent = this.value + '%';
        renderCanvas();
    });
    
    document.getElementById('decorationSize').addEventListener('input', function() {
        document.getElementById('decorationSizeValue').textContent = this.value + '%';
        renderCanvas();
    });
    
    // 下载按钮
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
    
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', resetAll);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            uploadedImage = img;
            document.getElementById('controlPanel').style.display = 'block';
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 渲染画布
function renderCanvas() {
    if (!uploadedImage) return;
    
    // 设置画布大小
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    
    // 显示画布，隐藏占位符
    canvas.style.display = 'block';
    document.getElementById('placeholder').style.display = 'none';
    
    // 清空画布
    ctx.clearRect(0, 0, size, size);
    
    // 绘制背景
    drawBackground();
    
    // 绘制图片（圆形裁剪）
    drawCircularImage();
    
    // 绘制装饰框架
    if (currentFrame !== 'none') {
        drawFrame();
    }
    
    // 绘制文字
    if (document.getElementById('addText').checked) {
        drawText();
    }
}

// 绘制背景
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星星
    drawStars();
}

// 绘制星星
function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制圆形图片
function drawCircularImage() {
    const roundness = document.getElementById('roundness').value;
    const radius = canvas.width * 0.35;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 计算圆角
    const cornerRadius = (radius * 2 * roundness) / 100;
    
    ctx.save();
    
    // 创建圆形或圆角矩形裁剪路径
    if (roundness >= 45) {
        // 圆形
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
    } else {
        // 圆角矩形
        const x = centerX - radius;
        const y = centerY - radius;
        const width = radius * 2;
        const height = radius * 2;
        
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
    }
    
    ctx.clip();
    
    // 绘制图片
    const imgSize = radius * 2;
    const imgX = centerX - radius;
    const imgY = centerY - radius;
    
    // 计算图片的绘制尺寸，保持比例并填充整个区域
    const imgAspect = uploadedImage.width / uploadedImage.height;
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > 1) {
        drawHeight = imgSize;
        drawWidth = imgSize * imgAspect;
        offsetX = -(drawWidth - imgSize) / 2;
        offsetY = 0;
    } else {
        drawWidth = imgSize;
        drawHeight = imgSize / imgAspect;
        offsetX = 0;
        offsetY = -(drawHeight - imgSize) / 2;
    }
    
    ctx.drawImage(uploadedImage, imgX + offsetX, imgY + offsetY, drawWidth, drawHeight);
    
    ctx.restore();
    
    // 绘制边框
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 15;
    
    if (roundness >= 45) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        const x = centerX - radius;
        const y = centerY - radius;
        const width = radius * 2;
        const height = radius * 2;
        
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.stroke();
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// 绘制装饰框架
function drawFrame() {
    const size = document.getElementById('decorationSize').value / 100;
    
    switch(currentFrame) {
        case 'moon':
            drawMoonDecoration(size);
            break;
        case 'rabbit':
            drawRabbitDecoration(size);
            break;
        case 'mooncake':
            drawMooncakeDecoration(size);
            break;
        case 'lantern':
            drawLanternDecoration(size);
            break;
    }
}

// 绘制月亮装饰
function drawMoonDecoration(scale) {
    const moonSize = 120 * scale;
    
    // 右上角月亮
    ctx.save();
    ctx.translate(canvas.width - 150 * scale, 100 * scale);
    
    // 月亮主体
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, moonSize);
    gradient.addColorStop(0, '#fff9e6');
    gradient.addColorStop(1, '#ffd700');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, moonSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.fill();
    
    // 月亮陨石坑
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(-20 * scale, -20 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.arc(25 * scale, 15 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.arc(10 * scale, 30 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // 云朵
    drawClouds(scale);
}

// 绘制云朵
function drawClouds(scale) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    // 左下云
    drawCloud(150 * scale, canvas.height - 150 * scale, 80 * scale);
    // 右下云
    drawCloud(canvas.width - 200 * scale, canvas.height - 100 * scale, 60 * scale);
}

// 绘制单个云朵
function drawCloud(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    ctx.beginPath();
    ctx.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
    ctx.arc(0, -size * 0.3, size * 0.6, 0, Math.PI * 2);
    ctx.arc(size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 绘制兔子装饰
function drawRabbitDecoration(scale) {
    const positions = [
        { x: 100 * scale, y: 120 * scale },
        { x: canvas.width - 100 * scale, y: canvas.height - 120 * scale }
    ];
    
    positions.forEach(pos => {
        drawRabbit(pos.x, pos.y, 60 * scale);
    });
}

// 绘制兔子
function drawRabbit(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 兔子身体
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    
    // 头
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳朵
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.6, size * 0.2, size * 0.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(size * 0.3, -size * 0.6, size * 0.2, size * 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳朵内部
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 0.5, size * 0.1, size * 0.3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(size * 0.3, -size * 0.5, size * 0.1, size * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // 眼睛
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.2, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.2, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // 鼻子
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    ctx.arc(0, size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.1);
    ctx.lineTo(-size * 0.1, size * 0.25);
    ctx.moveTo(0, size * 0.1);
    ctx.lineTo(size * 0.1, size * 0.25);
    ctx.stroke();
    
    ctx.restore();
}

// 绘制月饼装饰
function drawMooncakeDecoration(scale) {
    const positions = [
        { x: 120 * scale, y: canvas.height - 130 * scale },
        { x: canvas.width - 120 * scale, y: 130 * scale }
    ];
    
    positions.forEach(pos => {
        drawMooncake(pos.x, pos.y, 70 * scale);
    });
}

// 绘制月饼
function drawMooncake(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 月饼主体 - 优化颜色，更真实美味
    const gradient = ctx.createRadialGradient(0, -size * 0.3, size * 0.2, 0, 0, size * 1.1);
    gradient.addColorStop(0, '#f4d03f');  // 亮金黄色（中心高光）
    gradient.addColorStop(0.3, '#daa520'); // 金黄色
    gradient.addColorStop(0.6, '#cd853f'); // 秘鲁棕
    gradient.addColorStop(0.85, '#a0642a'); // 深棕色
    gradient.addColorStop(1, '#704214');    // 边缘暗棕色
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加边缘光泽效果
    ctx.shadowColor = 'transparent';
    const glowGradient = ctx.createRadialGradient(0, -size * 0.4, 0, 0, 0, size * 0.6);
    glowGradient.addColorStop(0, 'rgba(255, 235, 180, 0.6)');
    glowGradient.addColorStop(1, 'rgba(255, 235, 180, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 月饼花纹 - 更深的颜色
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3.5;
    
    // 外圈
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内圈
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // 花纹
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const x1 = Math.cos(angle) * size * 0.3;
        const y1 = Math.sin(angle) * size * 0.3;
        const x2 = Math.cos(angle) * size * 0.68;
        const y2 = Math.sin(angle) * size * 0.68;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // 中心装饰花纹
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + Math.PI / 8;
        const x1 = Math.cos(angle) * size * 0.15;
        const y1 = Math.sin(angle) * size * 0.15;
        const x2 = Math.cos(angle) * size * 0.28;
        const y2 = Math.sin(angle) * size * 0.28;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // 中心文字（福）- 使用渐变色
    const textGradient = ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.2);
    textGradient.addColorStop(0, '#8b4513');
    textGradient.addColorStop(1, '#4a2511');
    ctx.fillStyle = textGradient;
    ctx.font = `bold ${size * 0.38}px "Microsoft YaHei", Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText('福', 0, 0);
    
    ctx.restore();
}

// 绘制BNB装饰
function drawBNBDecoration(scale) {
    // 四个角落放置BNB币
    const positions = [
        { x: 120 * scale, y: 120 * scale },
        { x: canvas.width - 120 * scale, y: 120 * scale },
        { x: 120 * scale, y: canvas.height - 120 * scale },
        { x: canvas.width - 120 * scale, y: canvas.height - 120 * scale }
    ];
    
    positions.forEach(pos => {
        drawBNBCoin(pos.x, pos.y, 60 * scale);
    });
    
    // 添加装饰粒子效果
    drawBNBParticles(scale);
}

// 绘制BNB币
function drawBNBCoin(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 外圈光晕
    const glowGradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.3);
    glowGradient.addColorStop(0, 'rgba(243, 186, 47, 0.4)');
    glowGradient.addColorStop(1, 'rgba(243, 186, 47, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 主币体 - 金色渐变
    const coinGradient = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size * 1.2);
    coinGradient.addColorStop(0, '#ffd966');
    coinGradient.addColorStop(0.4, '#f3ba2f');
    coinGradient.addColorStop(0.7, '#e6a51e');
    coinGradient.addColorStop(1, '#b8860b');
    
    ctx.fillStyle = coinGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // 边缘高光
    ctx.strokeStyle = '#fff8dc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内圈
    ctx.strokeStyle = '#cc9a1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    
    // 币安 Logo - Binance 标志
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    
    // 绘制 "Binance" 文字
    ctx.fillStyle = '#1e1e1e';
    ctx.font = `bold ${size * 0.22}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Binance', 0, -size * 0.05);
    
    // 绘制 "币安" 中文
    ctx.font = `bold ${size * 0.28}px "Microsoft YaHei", sans-serif`;
    ctx.fillText('币安', 0, size * 0.25);
    
    ctx.shadowColor = 'transparent';
    
    // 添加装饰性的线条
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.25);
    ctx.lineTo(size * 0.5, -size * 0.25);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, size * 0.5);
    ctx.lineTo(size * 0.5, size * 0.5);
    ctx.stroke();
    
    ctx.restore();
}

// 绘制BNB粒子效果
function drawBNBParticles(scale) {
    ctx.save();
    
    // 随机粒子
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = (Math.random() * 3 + 1) * scale;
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        particleGradient.addColorStop(0, 'rgba(243, 186, 47, 0.8)');
        particleGradient.addColorStop(1, 'rgba(243, 186, 47, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 实心粒子
        ctx.fillStyle = '#f3ba2f';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 绘制灯笼装饰
function drawLanternDecoration(scale) {
    const positions = [
        { x: 150 * scale, y: 100 * scale },
        { x: canvas.width - 150 * scale, y: 100 * scale }
    ];
    
    positions.forEach(pos => {
        drawLantern(pos.x, pos.y, 50 * scale);
    });
}

// 绘制灯笼
function drawLantern(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 灯笼顶部
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(0, -size * 1.2, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 灯笼主体
    const gradient = ctx.createLinearGradient(-size, 0, size, 0);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.5, '#ff6666');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(-size * 0.8, -size * 0.5, -size * 0.8, size * 0.5, 0, size);
    ctx.bezierCurveTo(size * 0.8, size * 0.5, size * 0.8, -size * 0.5, 0, -size);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // 横条纹
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    for (let i = -0.6; i <= 0.6; i += 0.4) {
        const width = Math.cos(Math.asin(i)) * size * 0.8;
        ctx.beginPath();
        ctx.moveTo(-width, i * size);
        ctx.lineTo(width, i * size);
        ctx.stroke();
    }
    
    // 灯笼底部
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(0, size * 1.2, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 流苏
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
        const offsetX = (i - 2) * size * 0.15;
        ctx.beginPath();
        ctx.moveTo(offsetX, size * 1.35);
        ctx.lineTo(offsetX, size * 1.8);
        ctx.stroke();
        
        // 流苏末端
        ctx.beginPath();
        ctx.arc(offsetX, size * 1.85, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 绘制文字
function drawText() {
    const text = document.getElementById('customText').value || '中秋快乐';
    
    // 底部文字
    ctx.save();
    
    ctx.font = 'bold 60px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // 文字渐变
    const gradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height - 40);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(1, '#ffed4e');
    
    ctx.fillStyle = gradient;
    ctx.fillText(text, canvas.width / 2, canvas.height - 70);
    
    // 文字描边
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.strokeText(text, canvas.width / 2, canvas.height - 70);
    
    ctx.restore();
}

// 下载图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = '中秋头像.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 重置所有
function resetAll() {
    uploadedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('controlPanel').style.display = 'none';
    canvas.style.display = 'none';
    document.getElementById('placeholder').style.display = 'flex';
    
    // 重置控制项
    currentFrame = 'moon';
    document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.frame === 'moon') {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('addText').checked = true;
    document.getElementById('customText').value = '中秋快乐';
    document.getElementById('roundness').value = 50;
    document.getElementById('roundnessValue').textContent = '50%';
    document.getElementById('decorationSize').value = 100;
    document.getElementById('decorationSizeValue').textContent = '100%';
}

