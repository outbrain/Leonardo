import {Dispatch} from 'redux'
import * as React from 'react'
import './recorder-list.less'
import {connect} from 'react-redux';
import RecorderItem from '../item/recorder-item';

interface RecorderListProps {
  filterValue: string,
  states: any[];
  items: any[];
  dispatch: Dispatch<{}>;
}

class RecorderList extends React.Component<RecorderListProps, any> {

  transformStates(items) {
    return items
      .map((item, i) => {
        return (
          <RecorderItem item={item} key={i}/>
        )
      });
  }

  render() {
    const {items} = this.props;
    return (
      <div className="recorder-container">
        <div className="recorder-list">
          {this.transformStates(items)}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return ({
    items: state.recorderItems
  })
};

export default connect(mapStateToProps)(RecorderList);
