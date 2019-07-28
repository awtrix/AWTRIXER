(function () {
  var ns = $.namespace('pskl.controller.settings.exportimage');

  var BLACK = '#000000';

  ns.MiscExportController = function (piskelController) {
    this.piskelController = piskelController;
  };

  pskl.utils.inherit(ns.MiscExportController, pskl.controller.settings.AbstractSettingController);

  ns.MiscExportController.prototype.init = function () {
    var cDownloadButton = document.querySelector('.c-download-button');
    this.addEventListener(cDownloadButton, 'click', this.onDownloadCFileClick_);
  };

  ns.MiscExportController.prototype.onDownloadCFileClick_ = function (evt) {
    var fileName = this.getPiskelName_() + '.c';
    var cName = this.getPiskelName_().replace(' ', '_');
    var width = this.piskelController.getWidth();
    var height = this.piskelController.getHeight();
    var frameCount = this.piskelController.getFrameCount();

    var animation = [];

    for (var i = 0; i < frameCount; i++) {
      var render = this.piskelController.renderFrameAt(i, true);
      var context = render.getContext('2d');
      var imgd = context.getImageData(0, 0, width, height);
      var pix = imgd.data;
      var frame = [];

      for (var j = 0; j < pix.length; j += 4) {
        frame.push(this.rgbTo565(pix[j], pix[j + 1], pix[j + 2]));
      }
      animation.push(frame);
    }
    console.log(animation);
  };

  ns.MiscExportController.prototype.getPiskelName_ = function () {
    return this.piskelController.getPiskel().getDescriptor().name;
  };

  ns.MiscExportController.prototype.rgbTo565 = function (r, g, b) {
    var B = (b >> 3) & 0x1f;
    var G = ((g >> 2) & 0x3f) << 5;
    var R = ((r >> 3) & 0x1f) << 11;
    var rgb = (R | G | B);
    return rgb;
  };
})();
