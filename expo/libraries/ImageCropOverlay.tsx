import React from 'react';
import { View, PanResponder, PanResponderInstance, PanResponderGestureState, GestureResponderEvent } from 'react-native';
import CropRectCalculator from './CropRectCalculator';
import Rect from './Rect';

type State = {
  draggingTL: boolean;
  draggingTM: boolean;
  draggingTR: boolean;
  draggingML: boolean;
  draggingMM: boolean;
  draggingMR: boolean;
  draggingBL: boolean;
  draggingBM: boolean;
  draggingBR: boolean;
  initialTop: number;
  initialLeft: number;
  initialWidth: number;
  initialHeight: number;
  offsetTop: number;
  offsetLeft: number;
};

type Props = {
  initialTop: number;
  initialLeft: number;
  initialWidth: number;
  initialHeight: number;
  imageLayout: {
    x: number,
    y: number,
    width: number,
    height: number;
  };
  ratio?: {
    width: number;
    height: number;
  };
  borderColor?: string;
  safeAreaHeight: number;
  scrollOffsetY: number;
  minWidth: number;
  minHeight: number;
  onStartLayoutChange: () => void;
  onLayoutChanged: (top: number, left: number, width: number, height: number) => void;
};

class ImageCropOverlay extends React.Component<Props, State> {
  panResponder: PanResponderInstance | undefined;

  constructor(props: Props) {
    super(props);

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
    };
  }

  UNSAFE_componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd,
    });
  }

  calcRect() {
    const {
      draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR, initialTop, initialLeft, initialHeight, initialWidth, offsetTop, offsetLeft
    } = this.state;
    const { ratio } = this.props;

    const calculator = new CropRectCalculator(
      new Rect(
        initialTop,
        initialLeft,
        initialWidth,
        initialHeight,
      ),
      (ratio && ratio.width && ratio.height) ? ratio.width / ratio.height : undefined,
      this.props.minWidth,
      this.props.minHeight,
      new Rect(
        this.props.imageLayout.y,
        this.props.imageLayout.x,
        this.props.imageLayout.width,
        this.props.imageLayout.height
      )
    );

    if (draggingTL) {
      calculator.fixRight();
      calculator.fixBottom();
      calculator.moveLeft(offsetLeft);
      calculator.moveTop(offsetTop);
    } else if (draggingTR) {
      calculator.fixLeft();
      calculator.fixBottom();
      calculator.moveRight(offsetLeft);
      calculator.moveTop(offsetTop);
    } else if (draggingBL) {
      calculator.fixRight();
      calculator.fixTop();
      calculator.moveLeft(offsetLeft);
      calculator.moveBottom(offsetTop);
    } else if (draggingBR) {
      calculator.fixTop();
      calculator.fixLeft();
      calculator.moveRight(offsetLeft);
      calculator.moveBottom(offsetTop);
    } else if (draggingTM) {
      calculator.fixBottom();
      calculator.moveTop(offsetTop);
    } else if (draggingBM) {
      calculator.fixTop();
      calculator.moveBottom(offsetTop);
    } else if (draggingMR) {
      calculator.fixLeft();
      calculator.moveRight(offsetLeft);
    } else if (draggingML) {
      calculator.fixRight();
      calculator.moveLeft(offsetLeft);
    } else if (draggingMM) {
      calculator.move(offsetTop, offsetLeft);
    }

    return calculator.toObject();
  }

  render() {
    const {
      draggingTL, draggingTM, draggingTR, draggingML, draggingMM, draggingMR, draggingBL, draggingBM, draggingBR,
    } = this.state;
    const style = this.calcRect();
    const { borderColor } = this.props;

    const panHandlers = this.panResponder ? this.panResponder.panHandlers : {};
    return (
      <View {...panHandlers}
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
    );
  }

  getTappedItem(x: number, y: number) {
    const {
      initialLeft, initialTop, initialWidth, initialHeight,
    } = this.state;

    const xPercent = (x - initialLeft) / (initialWidth);
    const yPercent = (y - initialTop - this.props.safeAreaHeight + this.props.scrollOffsetY) / (initialHeight);

    const xKey = xPercent <= 0.33 ? 'l'
      : xPercent > 0.66 ? 'r'
        : 'm';

    const yKey = yPercent <= 0.33 ? 't'
      : yPercent > 0.66 ? 'b'
        : 'm';

    return yKey + xKey;
  }

  // Should we become active when the user presses down on the square?
  handleStartShouldSetPanResponder = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => true;

  // We were granted responder status! Let's update the UI
  handlePanResponderGrant = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    // console.log(event.nativeEvent.locationX + ', ' + event.nativeEvent.locationY)

    this.props.onStartLayoutChange();

    const selectedItem = this.getTappedItem(e.nativeEvent.pageX, e.nativeEvent.pageY);
    if (selectedItem == 'tl') {
      this.setState({ draggingTL: true });
    } else if (selectedItem == 'tm') {
      this.setState({ draggingTM: true });
    } else if (selectedItem == 'tr') {
      this.setState({ draggingTR: true });
    } else if (selectedItem == 'ml') {
      this.setState({ draggingML: true });
    } else if (selectedItem == 'mm') {
      this.setState({ draggingMM: true });
    } else if (selectedItem == 'mr') {
      this.setState({ draggingMR: true });
    } else if (selectedItem == 'bl') {
      this.setState({ draggingBL: true });
    } else if (selectedItem == 'bm') {
      this.setState({ draggingBM: true });
    } else if (selectedItem == 'br') {
      this.setState({ draggingBR: true });
    }
  };

  // Every time the touch/mouse moves
  handlePanResponderMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    // Keep track of how far we've moved in total (dx and dy)
    this.setState({
      offsetTop: gestureState.dy,
      offsetLeft: gestureState.dx,
    });
  };

  // When the touch/mouse is lifted
  handlePanResponderEnd = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
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
    };

    this.setState(state);
    this.props.onLayoutChanged(state.initialTop, state.initialLeft, state.initialWidth, state.initialHeight);
  };
}

export default ImageCropOverlay;
