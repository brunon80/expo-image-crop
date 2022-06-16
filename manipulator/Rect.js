class Rect
{
    constructor(top, left, width, height, ratio, minWidth, minHeight){
        this.top = top
        this.left = left
        this.width = width
        this.height = height
        this.ratio = ratio
        this.minHeight = minHeight
        this.minWidth = minWidth

        this.fix = {
            top: false,
            left: false,
            bottom: false,
            right: false,
        }
    }

    get bottom(){
        return this.top + this.height
    }

    get right(){
        return this.left + this.width
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
        const newWidth = this.width + amount
        if(newWidth < this.minWidth){
            this.width = this.minWidth
        } else {
            this.width = newWidth;
        }
        
        if(!this.fix.left){
            this.left += amount;
        }
    }

    moveRight(amount){
        this._moveRight(amount)

        if(this.ratio){
            const height = this.width / this.ratio
            const diff =  height - this.height
            if(this.fix.top){
                this._moveBottom(diff)
            } else if(this.fix.bottom) {
                this._moveTop(-diff)
            } else if(this.fix.left) {
                this.top -= diff / 2
                this.height += diff
            }
        }
    }

    _moveLeft(amount){
        if(this.fix.right){
            const newWidth = this.width - amount
            if(newWidth < this.minWidth){
                const diff = newWidth - this.minWidth
                amount += diff
                this.width = this.minWidth
            } else {
                this.width = newWidth
            }
        }

        this.left += amount
    }

    moveLeft(amount){
        this._moveLeft(amount)

        if(this.ratio){
            const height = this.width / this.ratio
            const diff =  height - this.height
            if(this.fix.top){
                this._moveBottom(diff)
            } else if(this.fix.bottom) {
                this._moveTop(-diff)
            } else if(this.fix.right) {
                this.top -= diff / 2
                this.height += diff
            }
        }
    }

    _moveTop(amount){
        if(this.fix.bottom){
            const newHeight = this.height - amount
            if(newHeight < this.minHeight){
                const diff = newHeight - this.minHeight
                amount += diff
                this.height = this.minHeight
            } else {
                this.height = newHeight
            }

        }

        this.top += amount
    }

    moveTop(amount){
        this._moveTop(amount)

        if(this.ratio){
            const width = this.height * this.ratio
            const diff =  width - this.width
            if(this.fix.left){
                this._moveRight(diff)
            } else if(this.fix.right) {
                this._moveLeft(-diff)
            } else if(this.fix.bottom) {
                this.left -= diff / 2
                this.width += diff
            }
        }
    }

    _moveBottom(amount){
        const newHeight = this.height + amount;
        if(newHeight < this.minHeight){
            this.height = this.minHeight
        } else {
            this.height = newHeight
        }

        if(!this.fix.top){
            this.top -= amount
        }
    }

    moveBottom(amount){
        this._moveBottom(amount)

        if(this.ratio){
            const width = this.height * this.ratio
            const diff =  width - this.width
            if(this.fix.left){
                this._moveRight(diff)
            } else if(this.fix.right) {
                this._moveLeft(-diff)
            } else if(this.fix.top) {
                this.left -= diff / 2
                this.width += diff
            }
        }
    }    

    toObject(){
        return {
            top: this.top,
            left: this.left,
            width: this.width,
            height: this.height
        }
    }
}


export default Rect