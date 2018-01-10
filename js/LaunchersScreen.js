import React from 'react'
import { FlatList, View, TouchableOpacity, Text, StyleSheet } from
  'react-native'
import SocketService from './SocketService.js'

class LauncherItem extends React.PureComponent {
  render () {
    return (
      <TouchableOpacity style={styles.launcherItem}
        onPress={() => this.props.onPress()}>
        <View>
          <Text style={styles.launcherName}>
            {this.props.name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

export class LaunchersList extends React.PureComponent {
  _renderItem (item, index, navigation) {
    return <LauncherItem name={(item.name.length > 0) ? item.name :
      `Untitled Launcher ${index + 1}`} onPress={() => {
        SocketService.send(JSON.stringify({
          type: 'launch',
          name: item.name,
          index
        }))
        navigation.navigate('Session')
      }} />
  }

  render () {
    if (this.props.launchers.length > 0) {
      return <FlatList data={this.props.launchers}
        renderItem={({ item, index }) => {
          return this._renderItem(item, index, this.props.navigation)
        }}
        keyExtractor={(item, index) => { return index }}/>
    } else {
      return <Text style={styles.warning}>No launchers found! Please add some
        launchers on the remote device, and this screen should automatically
      refresh.</Text>
    }
  }
}

export default class LaunchersScreen extends React.Component {
  static navigationOptions = {
    title: 'Launchers'
  }

  constructor (props) {
    super(props)

    this.state = {
      launchers: []
    }
  }

  render () {
    return <LaunchersList launchers={this.state.launchers}
      navigation={this.props.navigation} />
  }

  componentWillMount () {
    SocketService.on('message', this._onSocketMessage)
    SocketService.send(JSON.stringify({
      type: 'getlaunchers'
    }))
  }

  componentWillUnmount () {
    SocketService.off(this._onSocketMessage)
  }

  _onSocketMessage = (msg) => {
    if (msg.type === 'setlaunchers') {
      this.setState({
        launchers: msg.launchers
      })
    }
  }
}

const styles = StyleSheet.create({
  warning: {
    margin: 16
  },
  launcherItem: {
    backgroundColor: '#DDDDDD',
    borderBottomColor: '#333333',
    borderBottomWidth: 1,
    padding: 16
  },
  launcherName: {
    fontSize: 24
  }
})
