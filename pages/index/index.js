// index.js

Page({
  data: {
    angle: 0,
    prizeList: [
      { label: "1", text: "Prize 1" },
      { label: "2", text: "Prize 2" },
      { label: "3", text: "Prize 3" },
      { label: "4", text: "Prize 4" },
      { label: "5", text: "Prize 5" },
      { label: "6", text: "Prize 6" }
    ],
    isSpinning: false,
    buttonText: "开始",
    tempPrizeText: "",
    tempPrizeList: [],
    showConfigModal: false
  },
  onReady() {
    this.drawWheel(this.data.angle);
  },
  drawWheel(angle = 0) {
    const prizes = this.data.prizeList;
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
      // Draw label only
      ctx.save();
      ctx.translate(size, size);
      ctx.rotate(sectorAngle + Math.PI / N);
      ctx.setFillStyle('#333');
      ctx.setFontSize(15);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(prizes[i].label, radius * 0.7, 0);
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
    // 在drawWheel函数中，每个奖项分界处绘制黑线
    for (let i = 0; i < N; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(size, size);
      const angle = (2 * Math.PI / N) * i;
      ctx.lineTo(size + radius * Math.cos(angle), size + radius * Math.sin(angle));
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.draw();
    ctx.restore();
  },
  getSelectedPrize(angle, prizes) {
    const N = prizes.length;
    const sectorAngle = 360 / N;
    // 转盘起始位置不是prize A, 而是price E, 所以修改初始角度
    const index = Math.floor((angle-270) % 360 / sectorAngle);
    // 转盘不是price A-> price B->...->price F, 而是 price F-> price E...
    return prizes[N - 1 - index];
  },
  startRotate() {
    if (this.data.isSpinning) return;
    this.setData({ isSpinning: true, buttonText: "转动中...", angle: 0 });
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
    const prizes = this.data.prizeList;
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
          content: `已选中：${selected.label} - ${selected.text}`,
          showCancel: false
        });
        // Reset spinning state and button text
        this.setData({ isSpinning: false, buttonText: "开始" });
      }
    };
    animate();
  },
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },
  openPrizeConfig() {
    this.setData({
      showConfigModal: true,
      tempPrizeList: [...this.data.prizeList],
      tempPrizeText: ''
    });
  },
  handleCloseTap() {
    if (this.data.tempPrizeText || (this.data.tempPrizeList && this.data.tempPrizeList.length > 0)) {
      wx.showModal({
        title: '提示',
        content: '你有未保存的修改，是否关闭？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              showConfigModal: false,
              tempPrizeText: '',
              tempPrizeList: []
            });
          }
        }
      });
    } else {
      this.setData({ showConfigModal: false });
    }
  },
  handleTextInput(e) {
    this.setData({ tempPrizeText: e.detail.value });
  },
  handleAddPrize() {
    const text = this.data.tempPrizeText.trim();
    if (!text) return;
    const idx = this.data.tempPrizeList.length + 1;
    const newPrize = { label: `${idx}`, text };
    this.setData({
      tempPrizeList: [...this.data.tempPrizeList, newPrize],
      tempPrizeText: ''
    });
  },
  handleRemovePrize(e) {
    const idx = e.currentTarget.dataset.index;
    const list = [...this.data.tempPrizeList];
    list.splice(idx, 1);
    this.setData({ tempPrizeList: list });
  },
  handleSavePrizePool() {
    let tempPrizeList = [...this.data.tempPrizeList];
    const text = this.data.tempPrizeText.trim();
    if (text) {
      const idx = tempPrizeList.length + 1;
      tempPrizeList.push({ label: `${idx}`, text });
    }
    this.setData({
      prizeList: tempPrizeList,
      tempPrizeText: '',
      tempPrizeList: [],
      showConfigModal: false
    });
    this.drawWheel(this.data.angle);
  },
  handleResetPrizePool() {
    wx.showModal({
      title: '重置奖池',
      content: '确定要清空当前奖项吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ tempPrizeList: [], tempPrizeText: '' });
        }
      }
    });
  }
});
