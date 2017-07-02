import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as React from 'react';

interface AppProps {
  items: any[];
  dispatch: Dispatch<{}>;
}

class App extends React.Component<any, any> {
  render() {
    const { todos, dispatch } = this.props;

    return (
      <div>
        <div>{this.props.items[0].text}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});

export default connect(mapStateToProps)(App);