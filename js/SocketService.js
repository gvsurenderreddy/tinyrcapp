let SocketService = {
  _ws: null,

  _subscriptions: {
    open: [],
    close: [],
    message: []
  },

  on: function (event, callback) {
    switch (event) {
      case 'open':
        this._subscriptions.open.push(callback)
        break

      case 'close':
        this._subscriptions.close.push(callback)
        break

      case 'message':
        this._subscriptions.message.push(callback)
        break
    }
  },

  off: function (callback) {
    this._removeSubscription(this._subscriptions.open, callback)
    this._removeSubscription(this._subscriptions.close, callback)
    this._removeSubscription(this._subscriptions.message, callback)
  },

  send: function (message) {
    if (this._ws !== null) {
      this._ws.send(message)
    }
  },

  open: function (url) {
    if (this._ws !== null) {
      this._ws.close()
      this._ws = null
    }

    this._ws = new WebSocket(url)

    this._ws.addEventListener('open', (e) => {
      this._subscriptions.open.forEach((callback) => callback(e))
    })

    this._ws.addEventListener('close', (e) => {
      this._subscriptions.close.forEach((callback) => callback(e))

      this._ws = null
    })

    this._ws.addEventListener('message', (e) => {
      try {
        let msg = JSON.parse(e.data)
        this._subscriptions.message.forEach((callback) => callback(msg))
      } catch (e) {}
    })
  },

  close: function () {
    if (this._ws !== null) {
      this._ws.close()
      this._ws = null
    }
  },

  _removeSubscription: function (array, callback) {
    let i = array.indexOf(callback)
    if (i !== -1) {
      array.splice(i, 1)
    }
  }
}

export default SocketService
