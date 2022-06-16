class Rect
{
    constructor(top, left, width, height, fixRatio){
        this.top = top
        this.left = left
        this.width = width
        this.height = height
        this.ratio = fixRatio ? width / height : undefined

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

    moveRight(amount, checkRatio = true){
        this.width += amount;
        
        if(!this.fix.left){
            this.left += amount;
        }

        if(checkRatio && this.ratio){
            const height = this.width / this.ratio
            const diff =  height - this.height
            if(this.fix.top){
                this.moveBottom(diff, false)
            } else if(this.fix.bottom) {
                this.moveTop(-diff, false)
            } else if(this.fix.left) {
                this.top -= diff / 2
                this.height += diff
            }
        }
    }

    moveLeft(amount, checkRatio = true){
        this.left += amount;
        if(this.fix.right){
            this.width -= amount;
        }

        if(checkRatio && this.ratio){
            const height = this.width / this.ratio
            const diff =  height - this.height
            if(this.fix.top){
                this.moveBottom(diff, false)
            } else if(this.fix.bottom) {
                this.moveTop(-diff, false)
            } else if(this.fix.right) {
                this.top -= diff / 2
                this.height += diff
            }
        }
    }

    moveTop(amount, checkRatio = true){
        this.top += amount;
        if(this.fix.bottom){
            this.height -= amount;
        }

        if(checkRatio && this.ratio){
            const width = this.height * this.ratio
            const diff =  width - this.width
            if(this.fix.left){
                this.moveRight(diff, false)
            } else if(this.fix.right) {
                this.moveLeft(-diff, false)
            } else if(this.fix.bottom) {
                this.left -= diff / 2
                this.width += diff
            }
        }
    }

    moveBottom(amount, checkRatio = true){
        this.height += amount;
        if(!this.fix.top){
            this.top -= amount;
        }

        if(checkRatio && this.ratio){
            const width = this.height * this.ratio
            const diff =  width - this.width
            if(this.fix.left){
                this.moveRight(diff, false)
            } else if(this.fix.right) {
                this.moveLeft(-diff, false)
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