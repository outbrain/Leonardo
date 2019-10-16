import * as React from 'react';
import * as DropdownList from 'react-widgets/lib/DropdownList';
import './State.less';
import {connect} from "react-redux";
import {removeState} from "../../actions";
import { IState } from '../../../../configuration.srv';

interface StateProps extends React.Props<any> {
  item: IState;
}

interface PassedProps extends React.Props<any> {
  removeState: any;
}

class State extends React.Component<StateProps & PassedProps, any>{
  private inputElement;

  render() {
    const {item} = this.props;
    return (
      <div className="state-item">
        <input checked={item.active} onChange={this.toggleChange} ref={(input) => {this.inputElement = input;}} className="toggle toggle-ios" type="checkbox"/>
        <label className="toggle-btn" onClick={this.toggleState.bind(this)}></label>
        <span className={"state-verb " + "state-verb-" + item.verb.toLowerCase()}>{item.verb}</span>
        <span className="state-data-container">
          <span className="state-name">{item.name}</span>
          <span className="state-url">{item.url? item.url.toString() : ''}</span>
        </span>
        <DropdownList
          className="state-select"
          key={item.activeOption.name}
          onClick={(e) => {e.stopPropagation()}}
          onSelect={this.selectOption.bind(this)}
          textField={'name'}
          valueField={'name'}
          defaultValue={item.activeOption.name}
          data={item.options}/>
        <div title="Remove State" className="state-remove" onClick={this.removeState.bind(this)}></div>
      </div>
    )
  }

  toggleChange(event) {
  }

  removeState(event) {
    event.stopPropagation();
    window.parent['Leonardo'].removeState(this.props.item.name);
    this.props.removeState(this.props.item);
  }

  selectOption(option) {
    this.props.item.activeOption = option;
    window.parent['Leonardo'].activateStateOption(this.props.item.name, (this.props.item.activeOption as any).name);
  }

  setItemState(state: boolean) {
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
    event.stopPropagation();
    this.inputElement.checked = !this.inputElement.checked;
    this.setItemState(this.inputElement.checked);
  }

}

const mapDispatchToProps = dispatch => {
    return {
      removeState: item => dispatch(removeState({stateName: item.name}))
    }
};

export default connect<{},PassedProps, StateProps>(null, mapDispatchToProps)(State);
