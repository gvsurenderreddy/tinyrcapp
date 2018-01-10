// https://github.com/react-community/react-navigation/issues/271#issuecomment-344403238
// shortened because we don't need support for drawers here

import deepDiffer from 'react-native/lib/deepDiffer'
import { NavigationActions, StateUtils } from 'react-navigation'

const getActiveRouteForState = (navigationState) =>
  navigationState.routes ?
  getActiveRouteForState(navigationState.routes[navigationState.index]) :
  navigationState

const isEqualRoute = (route1, route2) => {
  if (route1.routeName !== route2.routeName) {
    return false
  }

  return !deepDiffer(route1.params, route2.params)
}

export default function withNavigationPreventDuplicate (getStateForAction) {
  const defaultGetStateForAction = getStateForAction

  const getStateForActionWithoutDuplicates = (action, state) => {
    if (action.type === NavigationActions.NAVIGATE) {
      const currentRoute = getActiveRouteForState(state)
      const nextRoute = action

      if (isEqualRoute(currentRoute, nextRoute)) {
        return null
      }
    }

    return defaultGetStateForAction(action, state)
  }

  return getStateForActionWithoutDuplicates
}
