import React from 'react'
import { View, Image, StyleSheet } from 'react-native'

export default class TouchController extends React.Component {
  constructor (props) {
    super(props)

    this._dpadDown = null
  }

  render () {
    return <View style={styles.controllerOverlay}>
      <View style={styles.controllerContainer}>
        <Image source={require('../joystick/dpad.png')} style={styles.dpad}
          onTouchStart={(e) => this._dpadTouchStart(e)}
          onTouchEnd={(e) => this._dpadTouchEnd(e)} />
        <View style={styles.rightContainer}>
          <Image source={require('../joystick/start.png')} style={styles.start}
            onTouchStart={() => this.props.onButtonChange('S', 'y')}
            onTouchEnd={() => this.props.onButtonChange('S', 'n')} />
          <View style={styles.abxyContainer}>
            <Image source={require('../joystick/a.png')} style={styles.abxy}
              onTouchStart={() => this.props.onButtonChange('A', 'y')}
              onTouchEnd={() => this.props.onButtonChange('A', 'n')} />
            <Image source={require('../joystick/b.png')} style={styles.abxy}
              onTouchStart={() => this.props.onButtonChange('B', 'y')}
              onTouchEnd={() => this.props.onButtonChange('B', 'n')} />
            <Image source={require('../joystick/x.png')} style={styles.abxy}
              onTouchStart={() => this.props.onButtonChange('X', 'y')}
              onTouchEnd={() => this.props.onButtonChange('X', 'n')} />
            <Image source={require('../joystick/y.png')} style={styles.abxy}
              onTouchStart={() => this.props.onButtonChange('Y', 'y')}
              onTouchEnd={() => this.props.onButtonChange('Y', 'n')} />
          </View>
        </View>
      </View>
    </View>
  }

  _dpadTouchStart (e) {
    let x = e.nativeEvent.locationX
    let y = e.nativeEvent.locationY

    if (y < 23) {
      this.props.onButtonChange('U', 'y')
      this._dpadDown = 'U'
    } else if (y > 53) {
      this.props.onButtonChange('D', 'y')
      this._dpadDown = 'D'
    } else {
      if (x < 38) {
        this.props.onButtonChange('L', 'y')
        this._dpadDown = 'L'
      } else {
        this.props.onButtonChange('R', 'y')
        this._dpadDown = 'R'
      }
    }
  }

  _dpadTouchEnd (e) {
    if (this._dpadDown !== null) {
      this.props.onButtonChange(this._dpadDown, 'n')
      this._dpadDown = null
    }
  }
}

const styles = StyleSheet.create({
  controllerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    zIndex: 1000,
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%'
  },
  controllerContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  rightContainer: {
    alignItems: 'flex-end'
  },
  abxyContainer: {
    flexDirection: 'row'
  },
  dpad: {
    flexDirection: 'row',
    marginRight: 4,
    width: 76,
    height: 76
  },
  start: {
    width: 72,
    height: 32,
    marginBottom: 4
  },
  abxy: {
    width: 42,
    height: 42,
    marginRight: 4
  }
})
