import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

import rootReducer from './main/reducer'
import {Reducer} from 'redux-actions';
import {Header} from './header'; // Or wherever you keep your reducers
import Home2 from './Home2'; // Or wherever you keep your reducers
import Home3 from './Home3'; // Or wherever you keep your reducers
import './style.less';
// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    reducers: rootReducer as Reducer<any, any>,
    router: routerReducer as Reducer<any, any>
  }),
  applyMiddleware(middleware)
)

// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={history}>
      <div>
        <Route exact path="*" component={Header}/>
        <Route path="/about" component={Home2}/>
        <Route path="/more" component={Home3}/>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);