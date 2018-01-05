import * as React from 'react';
import './EditOption.less';
import {IState} from '../../../../configuration.srv';

interface IEditOptionProps {
  selectedState: IState;
  onChange: any;
}

class EditOption extends React.Component<IEditOptionProps, any>{

  render() {
    const {selectedState} = this.props;
    if (!selectedState || !selectedState.activeOption) {
      return null;
    }
    return (
      <div className="leonardo-states-detail-container">
        <div className="leonardo-states-detail-top">
          Edit option <strong>{selectedState.activeOption.name}</strong> for <strong>{selectedState.name}</strong>
        </div>
        <div className="leonardo-states-detail-input">
          <span>Source: {selectedState.activeOption.from_local ? 'Local Storage': 'Configuration'} </span>
        </div>
        <div className="leonardo-states-detail-input">
          <div>Status code: </div>
          <input className="leonardo-states-detail-status"
                 defaultValue={selectedState.activeOption.status}
                 name="status"
                 onChange={this.props.onChange}/>
        </div>
        <div className="leonardo-states-detail-input">
          <div>Delay: </div>
          <input className="leonardo-states-detail-delay"
                 defaultValue={selectedState.activeOption.delay}
                 name="delay"
                 onChange={this.props.onChange}/>
        </div>
        <div>
          <br/>
          <span>Response:</span>
          <button className="leonardo-button leonardo-states-detail-edit">Advanced</button>
          <textarea className="leonardo-states-detail-json"
                    defaultValue={this.getResString(selectedState.activeOption.data)}
                    name="data"
                    onChange={this.props.onChange}>
          </textarea>
        </div>
      </div>
    )
  }

  private getResString(resopnse: string): string {
    let resStr: string;
    try {
      switch (typeof resopnse) {
        case 'function':
          resStr = resopnse.toString();
          break;
        case 'object':
          resStr = JSON.stringify(resopnse, null, 4);
          break;
        default:
          return resStr = resopnse;
      }
    }
    catch (e) {
      return resStr;
    }
    return resStr;
  }
}

export default EditOption;
