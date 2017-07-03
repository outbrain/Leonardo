import { Dispatch } from 'redux'
import * as React from 'react'
import States from './States'

interface AppProps {
  items: any[];
  dispatch: Dispatch<{}>;
}

class App extends React.Component<any, any> {
  render() {
    return (
      <States />
    )
  }
}

export default App