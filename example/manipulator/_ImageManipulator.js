/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native'

import {
    PanGestureHandler,
    ScrollView,
    State,
} from 'react-native-gesture-handler'

// import { USE_NATIVE_DRIVER } from '../config'
// import { LoremIpsum } from '../common'

export class DraggableBox extends Component {
    constructor(props) {
        super(props)
        this.resizing = false

        this._translateX = new Animated.Value(0)
        this._translateY = new Animated.Value(0)
        this._width = new Animated.Value(150)
        this._height = new Animated.Value(150)
        this.lastSize = { width: 150, height: 150 }
        this._lastOffset = { x: 0, y: 0 }
        this._onGestureEvent = Animated.event(
            [
                {
                    nativeEvent: {
                        translationX: this._translateX,
                        translationY: this._translateY,
                    },
                },
            ],
            { useNativeDriver: false },
        )
        this._onlayoutEvent = Animated.event([
            {
                nativeEvent: {
                    layout: {
                        width: this._width,
                        height: this._height,
                    },
                },
            },
        ])
    }

  _onHandlerStateChange = (event) => {
      console.log('########## _onHandlerStateChange ##########')
      console.log(event)
      console.log(this.resizing)
      if (event.nativeEvent.oldState === State.ACTIVE && this.resizing === false) {
          this._lastOffset.x += event.nativeEvent.translationX
          this._lastOffset.y += event.nativeEvent.translationY
          this._translateX.setOffset(this._lastOffset.x)
          this._translateX.setValue(0)
          this._translateY.setOffset(this._lastOffset.y)
          this._translateY.setValue(0)
      } else {
          this.lastSize.width += event.nativeEvent.translationX
          this.lastSize.height += event.nativeEvent.translationY
          this._width.setOffset(1)
          this._height.setOffset(1)
      }
  }

  onPressInTl = () => {
      this.resizing = true
  }
  onPressOutTl = () => {
      this.resizing = false
  }

  render() {
      return (
          <PanGestureHandler
              {...this.props}
              onGestureEvent={this._onGestureEvent}
              onHandlerStateChange={this._onHandlerStateChange}
          >
              <Animated.View
                  onLayout={this._onlayoutEvent}
                  style={[
                      styles.box,
                      {
                          width: this._width,
                          height: this._height,
                          transform: [
                              { translateX: this._translateX },
                              { translateY: this._translateY },
                          ],
                      },
                      this.props.boxStyle,
                  ]}

              >
                  <View
                      style={{
                          width: '100%',
                          height: '100%',
                      }}
                  >
                      <TouchableOpacity
                          onPressIn={this.onPressInTl}
                          onPressOut={this.onPressOutTl}
                          style={{
                              borderWidth: 2,
                              flex: 2,
                          }}
                      >
                          <View />
                      </TouchableOpacity>
                      <TouchableOpacity
                          //   onPressIn={this.onPressTl}
                          style={{
                              borderColor: 'green',
                              borderWidth: 2,
                              flex: 2,
                          }}
                      >
                          <View />
                      </TouchableOpacity>
                  </View>
              </Animated.View>
          </PanGestureHandler>
      )
  }
}

export default class Example extends Component {
    render() {
        return (
            <View style={styles.scrollView}>
                {/* <LoremIpsum words={40} /> */}
                <DraggableBox />
                {/* <LoremIpsum /> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    scrollView: {
        // flex: 1,
        height: '100%',
        backgroundColor: 'red',
    },
    box: {
        alignSelf: 'center',
        backgroundColor: 'plum',
        margin: 10,
        zIndex: 200,
    },
})
