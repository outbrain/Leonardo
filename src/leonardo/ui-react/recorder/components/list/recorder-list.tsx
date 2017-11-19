import * as React from 'react'
import './recorder-list.less'
import RecorderItem from '../item/recorder-item';
import {Dispatch} from 'redux';

interface RecorderListProps {
  items: any[];
  dispatch: Dispatch<any>;
}

class RecorderList extends React.Component<RecorderListProps, any> {

  private selectedItem;

  constructor() {
    super();
    this.componentDidMount = () => {
      this.props.dispatch({type: 'UPDATE_RECORDER_DATA'});
    };
  }

  transformStates(items) {
    return items
      .map((item, i) => Object.assign({}, item, { key: i }))
      .map(item => Object.assign({}, item, { selected: this.selectedItem && this.selectedItem.key === item.key }))
      .map(item => <RecorderItem item={item} key={item.key} onSelect={this.itemSelected.bind(this)} />);
  }

  itemSelected(item: any) {
    this.selectedItem = item.selected ? null : item;
    this.setState({});
  }

  render() {
    const {items} = this.props;
    return (
      <div className="recorder-container">
        <ul className="recorder-list">
          {this.transformStates(items)}
        </ul>
      </div>
    );
  }
}

export default RecorderList;
