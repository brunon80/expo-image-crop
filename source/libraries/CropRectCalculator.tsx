import Rect from './Rect';

class CropRectCalculator {
  readonly cropRect: Rect;
  readonly ratio: number | undefined;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly imageRect: Rect;
  readonly fix: {
    top: boolean,
    left: boolean,
    bottom: boolean,
    right: boolean,
  };

  constructor(cropRect: Rect, ratio: number | undefined, minWidth: number, minHeight: number, imageRect: Rect) {
    this.cropRect = cropRect;
    this.ratio = ratio;
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.imageRect = imageRect;

    this.fix = {
      top: false,
      left: false,
      bottom: false,
      right: false,
    };
  }

  fixRight() {
    this.fix.right = true;
  }

  fixBottom() {
    this.fix.bottom = true;
  }

  fixLeft() {
    this.fix.left = true;
  }

  fixTop() {
    this.fix.top = true;
  }

  move(yAmount: number, xAmount: number) {
    this.cropRect.left += xAmount;
    if (this.cropRect.left < this.imageRect.left) {
      const leftDiff = this.imageRect.left - this.cropRect.left;
      this.cropRect.left += leftDiff;
    }

    if (this.cropRect.right > this.imageRect.right) {
      const rightDiff = this.cropRect.right - this.imageRect.right;
      this.cropRect.left -= rightDiff;
    }

    this.cropRect.top += yAmount;
    if (this.cropRect.top < this.imageRect.top) {
      const topDiff = this.imageRect.top - this.cropRect.top;
      this.cropRect.top += topDiff;
    }

    if (this.cropRect.bottom > this.imageRect.bottom) {
      const bottomDiff = this.cropRect.bottom - this.imageRect.bottom;
      this.cropRect.top -= bottomDiff;
    }
  }

  _resizeWidthFromCenter(amount: number) {
    this.cropRect.left -= amount / 2;
    this.cropRect.width += amount;

    if (this.cropRect.left < this.imageRect.left) {
      const leftDiff = this.imageRect.left - this.cropRect.left;
      this.cropRect.left += leftDiff;
      this.cropRect.width -= leftDiff * 2;
    }
  }

  _resizeHeightFromCenter(amount: number) {
    this.cropRect.top -= amount / 2;
    this.cropRect.height += amount;

    if (this.cropRect.top < this.imageRect.top) {
      const topDiff = this.imageRect.top - this.cropRect.top;
      this.cropRect.top += topDiff;
      this.cropRect.height -= topDiff * 2;
    }
  }

  _moveRight(amount: number) {
    const newWidth = this.cropRect.width + amount;
    if (newWidth < this.minWidth) {
      this.cropRect.width = this.minWidth;
    } else {
      this.cropRect.width = newWidth;
    }

    if (!this.fix.left) {
      this.cropRect.left += amount;
    }

    if (this.cropRect.right > this.imageRect.right) {
      const maxDiff = this.cropRect.right - this.imageRect.right;
      this.cropRect.width -= maxDiff;
      if (!this.fix.left) {
        this.cropRect.left -= maxDiff;
      }
    }
  }

  moveRight(amount: number) {
    this._moveRight(amount);

    if (this.ratio) {
      const height = this.cropRect.width / this.ratio;
      const heightDiff = height - this.cropRect.height;
      if (this.fix.top) {
        this._moveBottom(heightDiff);
      } else if (this.fix.bottom) {
        this._moveTop(-heightDiff);
      } else if (this.fix.left) {
        this._resizeHeightFromCenter(heightDiff);
      }

      const width = this.cropRect.height * this.ratio;
      if (this.cropRect.width > width) {
        const widthDiff = this.cropRect.width - width;
        this.cropRect.width -= widthDiff;
      }
    }
  }

  _moveLeft(amount: number) {
    if (this.fix.right) {
      const newWidth = this.cropRect.width - amount;
      if (newWidth < this.minWidth) {
        const diff = newWidth - this.minWidth;
        amount += diff;
        this.cropRect.width = this.minWidth;
      } else {
        this.cropRect.width = newWidth;
      }
    }

    this.cropRect.left += amount;

    if (this.cropRect.left < this.imageRect.left) {
      const maxDiff = this.imageRect.left - this.cropRect.left;
      if (this.fix.right) {
        this.cropRect.width -= maxDiff;
      }

      this.cropRect.left += maxDiff;
    }
  }

  moveLeft(amount: number) {
    this._moveLeft(amount);

    if (this.ratio) {
      const height = this.cropRect.width / this.ratio;
      const heightDiff = height - this.cropRect.height;
      if (this.fix.top) {
        this._moveBottom(heightDiff);
      } else if (this.fix.bottom) {
        this._moveTop(-heightDiff);
      } else if (this.fix.right) {
        this._resizeHeightFromCenter(heightDiff);
      }

      const width = this.cropRect.height * this.ratio;
      if (this.cropRect.width > width) {
        const widthDiff = this.cropRect.width - width;
        this.cropRect.width -= widthDiff;
        this.move(0, widthDiff);
      }
    }
  }

  _moveTop(amount: number) {
    if (this.fix.bottom) {
      const newHeight = this.cropRect.height - amount;
      if (newHeight < this.minHeight) {
        const diff = newHeight - this.minHeight;
        amount += diff;
        this.cropRect.height = this.minHeight;
      } else {
        this.cropRect.height = newHeight;
      }

    }

    this.cropRect.top += amount;

    if (this.cropRect.top < this.imageRect.top) {
      const maxDiff = this.imageRect.top - this.cropRect.top;
      if (this.fix.bottom) {
        this.cropRect.height -= maxDiff;
      }

      this.cropRect.top += maxDiff;
    }
  }

  moveTop(amount: number) {
    this._moveTop(amount);

    if (this.ratio) {
      const width = this.cropRect.height * this.ratio;
      const widthDiff = width - this.cropRect.width;
      if (this.fix.left) {
        this._moveRight(widthDiff);
      } else if (this.fix.right) {
        this._moveLeft(-widthDiff);
      } else if (this.fix.bottom) {
        this._resizeWidthFromCenter(widthDiff);
      }

      const height = this.cropRect.width / this.ratio;
      if (this.cropRect.height > height) {
        const heightDiff = this.cropRect.height - height;
        this.cropRect.height -= heightDiff;
        this.move(heightDiff, 0);
      }
    }
  }

  _moveBottom(amount: number) {
    const newHeight = this.cropRect.height + amount;
    if (newHeight < this.minHeight) {
      this.cropRect.height = this.minHeight;
    } else {
      this.cropRect.height = newHeight;
    }

    if (!this.fix.top) {
      this.cropRect.top -= amount;
    }


    if (this.cropRect.bottom > this.imageRect.bottom) {
      const maxDiff = this.cropRect.bottom - this.imageRect.bottom;
      this.cropRect.height -= maxDiff;
      if (!this.fix.top) {
        this.cropRect.top -= maxDiff;
      }
    }
  }

  moveBottom(amount: number) {
    this._moveBottom(amount);

    if (this.ratio) {
      const width = this.cropRect.height * this.ratio;
      const widthDiff = width - this.cropRect.width;

      if (this.fix.left) {
        this._moveRight(widthDiff);
      } else if (this.fix.right) {
        this._moveLeft(-widthDiff);
      } else if (this.fix.top) {
        this._resizeWidthFromCenter(widthDiff);
      }

      const height = this.cropRect.width / this.ratio;
      if (this.cropRect.height > height) {
        const heightDiff = height - this.cropRect.height;
        this.cropRect.height += heightDiff;
      }
    }
  }

  toObject() {
    return {
      top: this.cropRect.top,
      left: this.cropRect.left,
      width: this.cropRect.width,
      height: this.cropRect.height
    };
  }
}


export default CropRectCalculator;