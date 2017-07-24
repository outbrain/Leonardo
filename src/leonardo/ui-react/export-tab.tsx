import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Export from './export/components/export/export';

interface ExportTabProps {
  states: any[];
  dispatch: Dispatch<any>;
}

class ExportTab extends React.Component<ExportTabProps, any> {
  render() {
    return (
        <Export states={this.props.states} dispatch={this.props.dispatch} />
    );
  }
}

const mapStateToProps = state => {
  return ({
    states: state.reducers.states
  })
};

export default connect(mapStateToProps)(ExportTab);
