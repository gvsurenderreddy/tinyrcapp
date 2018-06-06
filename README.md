# tinyRC

### Unfortunately, tinyRC is no longer maintained.

tinyRC is a cross-platform screensharing and remote desktop tool, with an emphasis on remotely playing desktop games and emulators on a mobile device.
This repo hosts the desktop client for the project. For the desktop client, see the [tinyrc-electron](https://github.com/iffyloop/tinyrc-electron) repo, and for the signaling server, visit the [tinyrc-node](https://github.com/iffyloop/tinyrc-node) repo.

## Getting Started

WARNING: Unfortunately, this app has only been tested on Android. If a contributor would like to add iOS support, that would be wonderful, but at the moment I don't have any test hardware.

### Prerequisites

Node.js and npm are required to run this software. The latest versions of both should be fine. For easy development, you'll probably also want to install the React Native CLI globally.

### Installing

Clone the repository

```
git clone https://github.com/iffyloop/tinyrc-electron.git && cd tinyrc-electron
```

Install dependencies from npm

```
npm install
```

(Optional but highly recommended): Install the React Native CLI globally

```
npm install -g react-native-cli
```

### Building and running

tinyrcapp is built with the default React Native CLI command:

```
react-native run-android
```

If you want to experiment with adding iOS support (which should not be that difficult), substite "ios" for "android":

```
react-native run-ios
```

## Coding style

This project adheres to [JS Standard Style](https://standardjs.com), but with extra experimental features like class properties since they greatly enhance the React Native development experience.

## License

This project is Unlicensed - see [LICENSE](LICENSE) for details.
