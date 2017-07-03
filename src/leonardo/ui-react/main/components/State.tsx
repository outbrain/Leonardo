import * as React from 'react';
import './State.less';
import UiUtils from '../../ui-utils';

interface IState {
  name: string;
  active?: boolean;
  activeOption?: {};
  jsonCallbackAdditionalParams?: string;
  jsonpCallback?: Function;
  options: any[];
  url: string;
  verb: 'GET' | 'POST' | 'PUT';
}

interface Prop {
  item: IState;
}
export default class State extends React.Component<Prop, State>{
  randomID = UiUtils.guidGenerator();

  render() {
    const {item} = this.props;
    const id = `state-toggle-${this.randomID}`;
    return (
      <div className="state-item">
        <input defaultChecked={this.props.item.active} id={id} className="toggle toggle-ios" type="checkbox"/>
        <label onClick={this.toggleState.bind(this)} className="toggle-btn" htmlFor={id} ></label>
        <span className={"state-verb " + "state-verb-" + item.verb.toLowerCase()}>{item.verb}</span>
        <span className="state-data-container">
          <span className="state-name">{item.name}</span>
          <span className="state-url">{item.url}</span>
        </span>
      </div>
    )
  }

  setItemState(state: boolean) {
    this.props.item.active = state;
    if (state) {
      Leonardo.activateStateOption(this.props.item.name, (this.props.item.activeOption as any).name);
    }
    else {
      Leonardo.deactivateState(this.props.item.name);

    }
  }

  private toggleState(event: Event) {
    this.setItemState(!this.props.item.active);
  }

  private isChecked(): string {
    return this.props.item.active ? 'checked' : '';
  }
}