import React from 'react'
import { AsyncStorage, View, Text, StyleSheet } from 'react-native'
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView }
  from 'react-native-webrtc'
import TouchController from './TouchController.js'
import SocketService from './SocketService.js'

export default class SessionScreen extends React.Component {
  static navigationOptions = {
    title: 'Session'
  }

  constructor (props) {
    super(props)

    this.state = {
      videoUrl: null
    }

    this._pc = null
    this._dc = null
  }

  render () {
    if (this.state.videoUrl === null) {
      return <Text>Waiting for video stream...</Text>
    } else {
      return <View style={styles.backgroundView}>
        <RTCView streamURL={this.state.videoUrl} style={styles.rtcView} />
        <TouchController onButtonChange={(i, d) => {
          if (this._dc !== null) {
            this._dc.send(JSON.stringify({ i, d }))
          }
        }} />
      </View>
    }
  }

  componentDidMount () {
    SocketService.on('message', this._onSocketMessage)

    SocketService.send(JSON.stringify({
      type: 'createpeerconnection'
    }))
  }

  componentWillUnmount () {
    SocketService.off(this._onSocketMessage)
  }

  _createPeerConnection (config) {
    let iceServers = []
    if (config !== null && config.stunUrl.length > 0) {
      iceServers.push({
        url: config.stunUrl
      })
    }

    if (config !== null && config.turnUrl.length > 0) {
      let turnServer = {
        url: config.turnUrl
      }
      if (config.turnUsername.length > 0) {
        turnServer.username = config.turnUsername
      }
      if (config.turnCredential.length > 0) {
        turnServer.credential = config.turnCredential
      }
      iceServers.push(turnServer)
    }

    this._pc = new RTCPeerConnection({
      iceServers
    })

    this._pc.addEventListener('icecandidate', (e) =>
      this._onIceCandidate(e.candidate))
    this._pc.addEventListener('iceconnectionstatechange', (e) =>
      this._onIceConnectionStateChange(e.iceConnectionState))
    this._pc.addEventListener('signalingstatechange', (e) =>
      this._onSignalingStateChange(e.signalingState))
    this._pc.addEventListener('addstream', (e) => this.setState({
      videoUrl: e.stream.toURL()
    }))
    this._pc.addEventListener('datachannel', (e) => this._dc = e.channel)
  }

  _onSocketMessage = (msg) => {
    switch (msg.type) {
    case 'offer':
      this._loadConfig().then((config) => this._onOffer(msg.sdp, config))
      break
    case 'newicecandidate':
      this._onNewIceCandidate(msg.candidate)
      break
    case 'hangup':
      this._hangUp()
      break
    }
  }

  _onOffer (sdp, config) {
    this._createPeerConnection(config)

    this._pc.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
      return this._pc.createAnswer()
    }).then((answer) => {
      return this._pc.setLocalDescription(answer)
    }).then(() => {
      let sdp = this._pc.localDescription
      SocketService.send(JSON.stringify({
        type: 'answer',
        sdp
      }))
    }).catch(() => this._onPeerConnectionError())
  }

  _onNewIceCandidate (candidate) {
    if (candidate === null) {
      return
    }
    let iceCandidate = new window.RTCIceCandidate(candidate)
    this._pc.addIceCandidate(iceCandidate).catch(() =>
      this._onPeerConnectionError())
  }

  _onIceCandidate (candidate) {
    SocketService.send(JSON.stringify({
      type: 'newicecandidate',
      candidate
    }))
  }

  _onIceConnectionStateChange (iceConnectionState) {
    switch (iceConnectionState) {
      case 'failed':
        this._onPeerConnectionError()
        break

      case 'closed':
      case 'disconnected':
        this._hangUp()
        break
    }
  }

  _onSignalingStateChange (signalingState) {
    if (signalingState === 'closed') {
      this._hangUp()
    }
  }

  _onPeerConnectionError () {
    this._hangUp()
  }

  _hangUp () {
    if (this._pc !== null) {
      this._pc.close()
      this._pc = null
    }
    SocketService.send(JSON.stringify({
      type: 'hangup'
    }))
    SocketService.close()
  }

  async _loadConfig () {
    try {
      let configString = await AsyncStorage.getItem('@tinyRCStore:config')
      try {
        let config = JSON.parse(configString)
        return config
      } catch (e) {}
    } catch (e) {}

    return null
  }
}

const styles = StyleSheet.create({
  backgroundView: {
    flex: 1,
    backgroundColor: '#111'
  },
  rtcView: {
    flex: 1,
    alignItems: 'stretch'
  }
})
