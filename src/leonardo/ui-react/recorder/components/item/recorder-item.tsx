import * as React from 'react'
import './recorder-item.less'

interface RecorderItemProps {
  item: any,
  onSelect: Function,
}

class RecorderItem extends React.Component<RecorderItemProps, any> {

  render() {
    const {item} = this.props;
    const verb = item.verb.toLowerCase();
    const stateName = item.recorded ? item.name : 'New';
    const url = item.url.substr(0, 110);
    const selectedClass = item.selected ? 'recorder-list-item-selected' : '';
    return (
      <div className={'recorder-list-item ' + selectedClass} onClick={this.props.onSelect.bind(this, this.props.item)}>
        <span className={`recorder-list-item-verb recorder-list-item-verb-${verb}`}>{verb.toUpperCase()}</span>
        <span className="recorder-list-item-url">{url}</span>
        <span className={'recorder-list-item-name' + (item.recorded ? '' : ' recorder-list-item-name-new')}>{stateName}</span>
      </div>
    );
  }
}

export default RecorderItem;
