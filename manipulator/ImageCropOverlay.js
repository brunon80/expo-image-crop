import React, { Component } from 'react'
import { View, PanResponder, Dimensions } from 'react-native'
import Rect from './Rect'

class ImageCropOverlay extends React.Component {
    constructor(props){
        super(props);

        this.hasRatio = this.props.ratio && this.props.ratio.width && this.props.ratio.height
        if(this.hasRatio){
            this.ratio = this.props.ratio.width / this.props.ratio.height
        }
        
        this.state = {
            draggingTL: false,
            draggingTM: false,
            draggingTR: false,
            draggingML: false,
            draggingMM: false,
            draggingMR: false,
            draggingBL: false,
            draggingBM: false,
            draggingBR: false,
            initialTop: this.props.initialTop,
            initialLeft: this.props.initialLeft,
            initialWidth: this.props.initialWidth,
            initialHeight: this.props.initialHeight,
    
            offsetTop: 0,
            offsetLeft: 0,
        }
    
        this.panResponder = {}
    }

    UNSAFE_componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderEnd,
        })
    }

    calcRect(){
        const {
            draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR, initialTop, initialLeft, initialHeight, initialWidth, offsetTop, offsetLeft
        } = this.state

        const rect = new Rect(
            initialTop,
            initialLeft,
            initialWidth,
            initialHeight,
            this.ratio,
            this.props.minWidth,
            this.props.minHeight
        )
        
        if(draggingTL){
            rect.fixRight()
            rect.fixBottom()
            rect.moveLeft(offsetLeft)
            rect.moveTop(offsetTop)
        } else if(draggingTR){
            rect.fixLeft()
            rect.fixBottom()
            rect.moveRight(offsetLeft)
            rect.moveTop(offsetTop)
        } else if(draggingBL){
            rect.fixRight()
            rect.fixTop()
            rect.moveLeft(offsetLeft)
            rect.moveBottom(offsetTop)
        } else if(draggingBR){
            rect.fixTop()
            rect.fixLeft()
            rect.moveRight(offsetLeft)
            rect.moveBottom(offsetTop)
        } else if(draggingTM){
            rect.fixBottom()
            rect.moveTop(offsetTop)
        } else if(draggingBM){
            rect.fixTop()
            rect.moveBottom(offsetTop)
        } else if(draggingMR){
            rect.fixLeft()
            rect.moveRight(offsetLeft)
        } else if(draggingML){
            rect.fixRight()
            rect.moveLeft(offsetLeft)
        } else if(draggingMM){
            rect.moveTop(offsetTop)
            rect.moveLeft(offsetLeft)
        }

        return rect.toObject();
    }

    render() {
        const {
            draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR, initialTop, initialLeft, initialHeight, initialWidth, offsetTop, offsetLeft,
        } = this.state
        const style = this.calcRect()
        const { borderColor } = this.props
        return (
            <View {...this.panResponder.panHandlers}
                style={[{
                    flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', borderStyle: 'solid', borderWidth: 2, borderColor, backgroundColor: 'rgb(0,0,0,0.5)',
                }, style]}
            >
                <View style={{
                    flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',
                }}
                >
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingTL ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingTM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingTR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                </View>
                <View style={{
                    flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',
                }}
                >
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingML ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingMM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingMR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                </View>
                <View style={{
                    flexDirection: 'row', width: '100%', flex: 1 / 3, backgroundColor: 'transparent',
                }}
                >
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingBL ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingBM ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                    <View style={{
                        borderColor, borderWidth: 0, backgroundColor: draggingBR ? 'transparent' : 'transparent', flex: 1 / 3, height: '100%',
                    }}
                    />
                </View>
                <View style={{
                    top: 0, left: 0, width: '100%', height: '100%', position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                >
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        >
                            <View style={{
                                position: 'absolute', left: 5, top: 5, borderLeftWidth: 2, borderTopWidth: 2, height: 20, width: 20, borderColor: '#f4f4f4', borderStyle: 'solid',
                            }}
                            />
                        </View>
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        />
                        <View style={{
                            flex: 3, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        >
                            <View style={{
                                position: 'absolute', right: 5, top: 5, borderRightWidth: 2, borderTopWidth: 2, height: 20, width: 20, borderColor: '#f4f4f4', borderStyle: 'solid',
                            }}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        />
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        />
                        <View style={{
                            flex: 3, borderBottomWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        />
                    </View>
                    <View style={{ flex: 1 / 3, flexDirection: 'row' }}>
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid', position: 'relative',
                        }}
                        >
                            <View style={{
                                position: 'absolute', left: 5, bottom: 5, borderLeftWidth: 2, borderBottomWidth: 2, height: 20, width: 20, borderColor: '#f4f4f4', borderStyle: 'solid',
                            }}
                            />
                        </View>
                        <View style={{
                            flex: 3, borderRightWidth: 1, borderColor: '#c9c9c9', borderStyle: 'solid',
                        }}
                        />
                        <View style={{ flex: 3, position: 'relative' }}>
                            <View style={{
                                position: 'absolute', right: 5, bottom: 5, borderRightWidth: 2, borderBottomWidth: 2, height: 20, width: 20, borderColor: '#f4f4f4', borderStyle: 'solid',
                            }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    getTappedItem(x, y) {
        const {
            initialLeft, initialTop, initialWidth, initialHeight,
        } = this.state

        const xPercent = (x - initialLeft) / (initialWidth)
        const yPercent = (y - initialTop - this.props.safeAreaHeight) / (initialHeight)

        const xKey =  xPercent <= 0.33 ? 'l'
                    : xPercent >  0.66 ? 'r'
                                       : 'm'

        const yKey =  yPercent <= 0.33 ? 't'
                    : yPercent >  0.66 ? 'b'
                                       : 'm'

        return yKey + xKey
    }

    // Should we become active when the user presses down on the square?
    handleStartShouldSetPanResponder = event => true

    // We were granted responder status! Let's update the UI
    handlePanResponderGrant = (event) => {
        // console.log(event.nativeEvent.locationX + ', ' + event.nativeEvent.locationY)

        const selectedItem = this.getTappedItem(event.nativeEvent.pageX, event.nativeEvent.pageY)
        if (selectedItem == 'tl') {
            this.setState({ draggingTL: true })
        } else if (selectedItem == 'tm') {
            this.setState({ draggingTM: true })
        } else if (selectedItem == 'tr') {
            this.setState({ draggingTR: true })
        } else if (selectedItem == 'ml') {
            this.setState({ draggingML: true })
        } else if (selectedItem == 'mm') {
            this.setState({ draggingMM: true })
        } else if (selectedItem == 'mr') {
            this.setState({ draggingMR: true })
        } else if (selectedItem == 'bl') {
            this.setState({ draggingBL: true })
        } else if (selectedItem == 'bm') {
            this.setState({ draggingBM: true })
        } else if (selectedItem == 'br') {
            this.setState({ draggingBR: true })
        }
    }

    // Every time the touch/mouse moves
    handlePanResponderMove = (e, gestureState) => {
        // Keep track of how far we've moved in total (dx and dy)
        this.setState({
            offsetTop: gestureState.dy,
            offsetLeft: gestureState.dx,
        })
    }

    // When the touch/mouse is lifted
    handlePanResponderEnd = (e, gestureState) => {
        const rect = this.calcRect();

        const state = {
            draggingTL: false,
            draggingTM: false,
            draggingTR: false,
            draggingML: false,
            draggingMM: false,
            draggingMR: false,
            draggingBL: false,
            draggingBM: false,
            draggingBR: false,
            offsetTop: 0,
            offsetLeft: 0,
            initialTop: rect.top,
            initialLeft: rect.left,
            initialHeight: rect.height,
            initialWidth: rect.width
        }

        this.setState(state)
        this.props.onLayoutChanged(state.initialTop, state.initialLeft, state.initialWidth, state.initialHeight)
    }
}

export default ImageCropOverlay
