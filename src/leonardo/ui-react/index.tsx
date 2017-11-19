import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {createStore, combineReducers, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import {Route} from 'react-router'
import 'react-widgets/lib/less/react-widgets.less';

import {ConnectedRouter, routerReducer, routerMiddleware, push} from 'react-router-redux'

import ScenarioReducer from './scenarios/reducer'
import {commonReducer} from './common';
import {Reducer} from 'redux-actions';
import {Header} from './header'; // Or wherever you keep your reducers
import RecorderTab from './recorder-tab'; // Or wherever you keep your reducers
import ExportTab from './export-tab'; // Or wherever you keep your reducers
import './style.less';
import {Slider} from './common'
import {CSSTransitionGroup} from 'react-transition-group'
import States from './scenarios/components/States/States';
export * from './scenarios/actions';
// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    commonReducer: commonReducer as Reducer<any, any>,
    scenariosReducer: ScenarioReducer as Reducer<any, any>,
    router: routerReducer as Reducer<any, any>
  }),
  applyMiddleware(middleware)
);

// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={history}>
      <div>
        <Route path="*" component={Header}/>
        <Route path="/states" component={States as any}/>
        <Route path="/recorder" component={RecorderTab as any}/>
        <Route path="/export" component={ExportTab}/>
        <CSSTransitionGroup
          transitionAppearTimeout={700}
          transitionAppear={true}
          transitionName="slide">
          <Slider/>
        </CSSTransitionGroup>
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
history.push('/states');


