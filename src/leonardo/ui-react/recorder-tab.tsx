import * as React from 'react';
import {connect} from 'react-redux';
import RecorderList from './recorder/components/list/recorder-list';
import {Dispatch} from 'redux';

interface RecorderTabProps {
  items: any[];
  dispatch: Dispatch<any>;
}

class RecorderTab extends React.Component<RecorderTabProps, any> {
  render() {
    return (
        <RecorderList items={this.props.items} dispatch={this.props.dispatch} />
    );
  }
}


const mapStateToProps = state => {
  return ({
    items: state.recorder.recorderItems
  })
};

export default connect(mapStateToProps)(RecorderTab);
