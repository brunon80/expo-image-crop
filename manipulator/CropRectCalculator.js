class CropRectCalculator
{
    constructor(cropRect, ratio, minWidth, minHeight, imageRect){
        this.cropRect = cropRect
        this.ratio = ratio
        this.minHeight = minHeight
        this.minWidth = minWidth
        this.imageRect = imageRect

        this.fix = {
            top: false,
            left: false,
            bottom: false,
            right: false,
        }
    }

    fixRight(){
        this.fix.right = true
    }

    fixBottom(){
        this.fix.bottom = true
    }

    fixLeft(){
        this.fix.left = true
    }

    fixTop(){
        this.fix.top = true
    }

    _moveRight(amount){
        const newWidth = this.cropRect.width + amount
        if(newWidth < this.minWidth){
            this.cropRect.width = this.minWidth
        } else {
            this.cropRect.width = newWidth;
        }
        
        if(!this.fix.left){
            this.cropRect.left += amount;
        }
    }

    moveRight(amount){
        this._moveRight(amount)

        if(this.ratio){
            const height = this.cropRect.width / this.ratio
            const diff =  height - this.cropRect.height
            if(this.fix.top){
                this._moveBottom(diff)
            } else if(this.fix.bottom) {
                this._moveTop(-diff)
            } else if(this.fix.left) {
                this.cropRect.top -= diff / 2
                this.cropRect.height += diff
            }
        }
    }

    _moveLeft(amount){
        if(this.fix.right){
            const newWidth = this.cropRect.width - amount
            if(newWidth < this.minWidth){
                const diff = newWidth - this.minWidth
                amount += diff
                this.cropRect.width = this.minWidth
            } else {
                this.cropRect.width = newWidth
            }
        }

        this.cropRect.left += amount
    }

    moveLeft(amount){
        this._moveLeft(amount)

        if(this.ratio){
            const height = this.cropRect.width / this.ratio
            const diff =  height - this.cropRect.height
            if(this.fix.top){
                this._moveBottom(diff)
            } else if(this.fix.bottom) {
                this._moveTop(-diff)
            } else if(this.fix.right) {
                this.cropRect.top -= diff / 2
                this.cropRect.height += diff
            }
        }
    }

    _moveTop(amount){
        if(this.fix.bottom){
            const newHeight = this.cropRect.height - amount
            if(newHeight < this.minHeight){
                const diff = newHeight - this.minHeight
                amount += diff
                this.cropRect.height = this.minHeight
            } else {
                this.cropRect.height = newHeight
            }

        }

        this.cropRect.top += amount
    }

    moveTop(amount){
        this._moveTop(amount)

        if(this.ratio){
            const width = this.cropRect.height * this.ratio
            const diff =  width - this.cropRect.width
            if(this.fix.left){
                this._moveRight(diff)
            } else if(this.fix.right) {
                this._moveLeft(-diff)
            } else if(this.fix.bottom) {
                this.cropRect.left -= diff / 2
                this.cropRect.width += diff
            }
        }
    }

    _moveBottom(amount){
        const newHeight = this.cropRect.height + amount;
        if(newHeight < this.minHeight){
            this.cropRect.height = this.minHeight
        } else {
            this.cropRect.height = newHeight
        }

        if(!this.fix.top){
            this.cropRect.top -= amount
        }
    }

    moveBottom(amount){
        this._moveBottom(amount)

        if(this.ratio){
            const width = this.cropRect.height * this.ratio
            const diff =  width - this.cropRect.width
            if(this.fix.left){
                this._moveRight(diff)
            } else if(this.fix.right) {
                this._moveLeft(-diff)
            } else if(this.fix.top) {
                this.cropRect.left -= diff / 2
                this.cropRect.width += diff
            }
        }
    }    

    toObject(){
        return {
            top: this.cropRect.top,
            left: this.cropRect.left,
            width: this.cropRect.width,
            height: this.cropRect.height
        }
    }
}


export default CropRectCalculator