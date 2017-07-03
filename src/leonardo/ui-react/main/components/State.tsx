import * as React from 'react';
import './State.less';

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
  render() {
    const {item} = this.props;
    return (
      <div className="leonardo-state-item">
        <span className={"leonardo-state-verb " + "leonardo-state-verb-" + item.verb.toLowerCase()}>{item.verb}</span>
        {item.name} | {item.active} | {item.url}
      </div>
    )
  }
}