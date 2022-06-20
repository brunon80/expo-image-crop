class Rect {
    constructor(top, left, width, height) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }
    get right() {
        return this.left + this.width;
    }
    get bottom() {
        return this.top + this.height;
    }
    toObject() {
        return {
            top: this.top,
            left: this.left,
            width: this.width,
            height: this.height
        };
    }
}
export default Rect;
