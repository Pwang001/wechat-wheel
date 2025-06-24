// index.js

Page({
  data: {
    angle: 0 // 当前转盘角度
  },
  startRotate() {
    // 生成 1800 到 3600 之间的随机角度（5~10圈）
    const min = 1800;
    const max = 3600;
    const randomAngle = Math.floor(Math.random() * (max - min + 1)) + min;
    this.setData({
      angle: randomAngle
    });
  }
});



