import * as React from 'react';
import * as DropdownList from 'react-widgets/lib/DropdownList';
import './State.less';
import UiUtils from '../../../ui-utils';

export interface IState {
  name: string;
  active?: boolean;
  activeOption?: {};
  jsonCallbackAdditionalParams?: string;
  jsonpCallback?: Function;
  options: any[];
  url: string;
  verb: 'GET' | 'POST' | 'PUT';
}

interface StateProps {
  item: IState;
}

export default class State extends React.Component<StateProps, State>{
  randomID = UiUtils.guidGenerator();

  render() {
    const {item} = this.props;
    const id = `state-toggle-${this.randomID}`;
    return (
      <div className="state-item">
        <input checked={item.active} onChange={this.toggleState.bind(this)}  id={id} className="toggle toggle-ios" type="checkbox"/>
        <label className="toggle-btn" htmlFor={id} ></label>
        <span className={"state-verb " + "state-verb-" + item.verb.toLowerCase()}>{item.verb}</span>
        <span className="state-data-container">
          <span className="state-name">{item.name}</span>
          <span className="state-url">{item.url}</span>
        </span>
        <DropdownList
          onSelect={this.selectOption.bind(this)}
          textField={'name'}
          valueField={'name'}
          defaultValue={item.activeOption}
          data={item.options}/>
      </div>
    )
  }

  selectOption(option) {
    this.props.item.activeOption = option;
    window.parent['Leonardo'].activateStateOption(this.props.item.name, (this.props.item.activeOption as any).name);
  }

  setItemState(state: boolean) {
    debugger;
    if (state) {
      window.parent['Leonardo'].activateStateOption(this.props.item.name, (this.props.item.activeOption as any).name);
    }
    else {
      window.parent['Leonardo'].deactivateState(this.props.item.name);
    }
    this.props.item.active = state;
    this.setState({});
  }

  private toggleState(event: Event) {
    this.setItemState(event.target['checked']);
  }

}