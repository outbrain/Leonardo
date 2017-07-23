import {Dispatch} from 'redux'
import * as React from 'react'
import './recorder-item.less'
import {connect} from 'react-redux';

interface RecorderItemProps {
  item: any,
  dispatch: Dispatch<{}>;
}

class RecorderItem extends React.Component<RecorderItemProps, any> {

  render() {
    const {item} = this.props;
    return (
      <div className="recorder-item">
          {item.name}
      </div>
    );
  }
}


const mapStateToProps = state => state;

export default connect(mapStateToProps)(RecorderItem);
