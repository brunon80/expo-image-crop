import React from 'react'
import {
    Platform, TouchableNativeFeedback, TouchableOpacity, View,
} from 'react-native'

const HybridTouch = ({ children, ...props }) => (Platform.OS === 'android'
    ? (
        <TouchableNativeFeedback {...props}>
            <View {...props}>
                {children}
            </View>
        </TouchableNativeFeedback>
    )
    : (
        <TouchableOpacity {...props}>
            {children}
        </TouchableOpacity>
    ))

export default HybridTouch
