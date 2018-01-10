import React from 'react'
import { AppRegistry, AppState, Alert } from 'react-native'
import { StackNavigator, NavigationActions } from 'react-navigation'
import OptionsScreen from './js/OptionsScreen.js'
import LaunchersScreen from './js/LaunchersScreen.js'
import SessionScreen from './js/SessionScreen.js'
import SocketService from './js/SocketService.js'
import withNavigationPreventDuplicate from
  './js/withNavigationPreventDuplicate.js'

const AppNavigator = StackNavigator({
  Options: {
    screen: OptionsScreen
  },
  Launchers: {
    screen: LaunchersScreen
  },
  Session: {
    screen: SessionScreen
  }
})

AppNavigator.router.getStateForAction = withNavigationPreventDuplicate(
  AppNavigator.router.getStateForAction)

class TinyRCApp extends React.Component {
  _navigator = null

  _handleSocketClose = (e) => {
    if (typeof e.message !== 'undefined') {
      if (e.message === null) {
        e.message = `Connection interrupted. Get out of the subway tunnel or \
connect to a better network and try again.`
      }
      Alert.alert('Connection failed',
        `Unable to reach the signaling server. Please check your settings and \
make sure you are connected to a network.

Error: ${e.message}`)
    }

    if (this._navigator !== null) {
      this._navigator.dispatch(NavigationActions.reset({
        index: 0,
        actions: [ NavigationActions.navigate({ routeName: 'Options' }) ]
      }))
    }
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      SocketService.send(JSON.stringify({
        type: 'hangup'
      }))
      SocketService.close()
    }
  }

  componentDidMount () {
    AppState.addEventListener('change', this._handleAppStateChange)

    SocketService.on('close', this._handleSocketClose)
  }

  componentWillUnmount () {
    AppState.removeEventListener('change', this._handleAppStateChange)

    SocketService.off(this._handleSocketClose)
  }

  render () {
    return <AppNavigator ref={(nav) => this._navigator = nav} />
  }
}

AppRegistry.registerComponent('tinyrcapp', () => TinyRCApp)
