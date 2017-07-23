import {Dispatch} from 'redux'
import * as React from 'react'
import './recorder-item.less'
import {connect} from 'react-redux';

interface RecorderItemProps {
  item: any,
  dispatch: Dispatch<{}>;
}

export default class RecorderItem extends React.Component<any, any> {

  render() {
    const {item} = this.props;
    return (
      <div className="recorder-item">
          {item.name}
      </div>
    );
  }
}

