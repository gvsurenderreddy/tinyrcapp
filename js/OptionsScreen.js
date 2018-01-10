import React from 'react'
import { AppState, AsyncStorage, Alert, ScrollView, View, Button, Text,
  TextInput, StyleSheet } from 'react-native'
import SocketService from './SocketService.js'

export default class OptionsScreen extends React.Component {
  static navigationOptions = {
    title: 'Options'
  }

  constructor (props) {
    super(props)

    this.state = {
      deviceId: '',
      signalingUrl: 'ws://localhost:6503',
      stunUrl: 'stun:stun.l.google.com:19302',
      turnUrl: '',
      turnUsername: '',
      turnCredential: ''
    }

    // We never have to reset this because the constructor will be called again if
    // navigation is reset (which happens on connection fail)
    this._connectAllowed = true
  }

  render () {
    return (
      <ScrollView>
        <View style={styles.loginContainer}>
          <Text>
            These settings must match the target device&apos;s configuration.
          </Text>
          <TextInput placeholder="Device ID (e.g. 12Xxxxx89)"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.deviceId}
            onChangeText={(text) => this.setState({ deviceId: text })} />
          <TextInput placeholder="Signaling URL" keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.signalingUrl}
            onChangeText={(text) => this.setState({ signalingUrl: text })} />
          <TextInput placeholder="STUN URL" keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.stunUrl}
            onChangeText={(text) => this.setState({ stunUrl: text })} />
          <TextInput placeholder="TURN URL" keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.turnUrl}
            onChangeText={(text) => this.setState({ turnUrl: text })} />
          <TextInput placeholder="TURN Username"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.turnUsername}
            onChangeText={(text) => this.setState({ turnUsername: text })} />
          <TextInput placeholder="Turn Credential" style={styles.lastItem}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={this.state.turnCredential}
            onChangeText={(text) => this.setState({ turnCredential: text })} />
          <Button title="Connect" style={styles.lastItem}
            onPress={() => this._connect()} />
        </View>
      </ScrollView>
    )
  }

  _connect () {
    // We will load the config again in SessionScreen, so make sure it is up to
    // date
    this._saveConfig()

    if (this._connectAllowed) {
      SocketService.open(this.state.signalingUrl)
      this._connectAllowed = false
    }
  }

  _onSocketOpen = () => {
    let deviceId = this.state.deviceId
    SocketService.send(JSON.stringify({
      type: 'join',
      room: deviceId
    }))
  }

  _onSocketMessage = (msg) => {
    if (msg.type === 'joinsuccess') {
      this.props.navigation.navigate('Launchers')
    } else if (msg.type === 'joinfail') {
      Alert.alert('Unable to connect to device',
        `Please check the Device ID setting and make sure that no other device \
is connected.`)
      SocketService.close()
    }
  }

  componentDidMount () {
    SocketService.on('open', this._onSocketOpen)
    SocketService.on('message', this._onSocketMessage)

    this._loadConfig()
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount () {
    SocketService.off(this._onSocketOpen)
    SocketService.off(this._onSocketMessage)

    this._saveConfig()
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      this._saveConfig()
    }
  }

  async _loadConfig () {
    try {
      let configString = await AsyncStorage.getItem('@tinyRCStore:config')
      try {
        let config = JSON.parse(configString)
        this.setState(config)
      } catch (e) {
        await AsyncStorage.removeItem('@tinyRCStorage:config')
      }
    } catch (e) {}
  }

  async _saveConfig () {
    try {
      await AsyncStorage.setItem('@tinyRCStore:config', JSON.stringify(this.state))
    } catch (e) {}
  }
}

const styles = StyleSheet.create({
  loginContainer: {
    margin: 20
  },
  lastItem: {
    marginBottom: 12
  }
})
