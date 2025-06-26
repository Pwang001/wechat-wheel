// index.js

Page({
  data: {
    angle: 0
  },
  onReady() {
    this.drawWheel(this.data.angle);
  },
  drawWheel(angle = 0) {
    const prizes = ["Prize A", "Prize B", "Prize C", "Prize D", "Prize E", "Prize F"];
    const N = prizes.length;
    const ctx = wx.createCanvasContext('wheelCanvas', this);
    const size = 156; // 600rpx / 2, canvas center
    const radius = 140; // match canvas size, so wheel fits exactly
    const colors = ['#ffe066', '#ffd700'];
    ctx.save();
    ctx.translate(size, size);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-size, -size);
    for (let i = 0; i < N; i++) {
      const sectorAngle = (2 * Math.PI / N) * i;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(size, size);
      ctx.arc(size, size, radius, sectorAngle, sectorAngle + 2 * Math.PI / N);
      ctx.closePath();
      ctx.setFillStyle(colors[i % 2]);
      ctx.fill();
      ctx.restore();
      // Draw text
      ctx.save();
      ctx.translate(size, size);
      ctx.rotate(sectorAngle + Math.PI / N);
      ctx.setFillStyle('#333');
      ctx.setFontSize(15);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(prizes[i], radius * 0.7, 0);
      ctx.restore();
    }
    // Draw outer circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size, size, radius, 0, 2 * Math.PI);
    ctx.setLineWidth(8);
    ctx.setStrokeStyle('#ffb347');
    ctx.stroke();
    ctx.restore();
    ctx.draw();
    ctx.restore();
  },
  getSelectedPrize(angle, prizes) {
    const N = prizes.length;
    // Normalize angle to [0, 360)
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    // Each sector covers this many degrees
    const sectorAngle = 360 / N;
    // The pointer is at 0 deg (top), so we need to map angle to sector
    // Since the wheel rotates clockwise, the prize at the pointer is at (360 - normalized)
    let pointerAngle = (360 - normalized + 180 / N) % 360;
    let index = Math.floor(pointerAngle / sectorAngle) % N + 1;
    return prizes[index];
  },
  startRotate() {
    // Reset wheel to 0 before spinning
    this.setData({ angle: 0 });
    this.drawWheel(0);
    const min = 1800;
    const max = 3600;
    const randomAngle = Math.floor(Math.random() * (max - min + 1)) + min;
    const targetAngle = randomAngle;
    const duration = 1500; // ms
    const frameRate = 1000 / 60;
    const totalFrames = duration / frameRate;
    const startAngle = 0;
    let frame = 0;
    const prizes = ["Prize A", "Prize B", "Prize C", "Prize D", "Prize E", "Prize F"];
    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const currentAngle = startAngle + (targetAngle - startAngle) * this.easeOutCubic(progress);
      this.setData({ angle: currentAngle });
      this.drawWheel(currentAngle);
      if (frame < totalFrames) {
        setTimeout(animate, frameRate);
      } else {
        this.setData({ angle: targetAngle });
        this.drawWheel(targetAngle);
        // Calculate and show selected prize
        const selected = this.getSelectedPrize(targetAngle, prizes);
        wx.showModal({
          title: '完成',
          content: `已选中：${selected}`,
          showCancel: false
        });
      }
    };
    animate();
  },
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
});



