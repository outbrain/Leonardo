import * as React from 'react';
import './EditOption.less';
import {connect} from 'react-redux';

interface EditOptionProps {
  selectedState: any;
  dispatch: any;
}

class EditOption extends React.Component<EditOptionProps, any>{

  render() {
    const {selectedState} = this.props;
    return (
      <div className="leonardo-states-detail-container">
        <div className="leonardo-states-detail-top">
          Edit option <strong>{selectedState.activeOption.name}</strong> for <strong>{selectedState.name}</strong>
        </div>
        <div className="leonardo-states-detail-input">
          <span>Source: {selectedState.activeOption.from_local ? 'Local Storage': 'Configuration'} </span>
        </div>
        <div className="leonardo-states-detail-input"><div>Status code: </div><input className="leonardo-states-detail-status" defaultValue={selectedState.activeOption.status}/></div>
        <div className="leonardo-states-detail-input"><div>Delay: </div><input className="leonardo-states-detail-delay" defaultValue={selectedState.activeOption.delay}/></div>
        <div>
          <br/>
          <span>Response:</span>    <button className="leonardo-button leonardo-states-detail-edit">Advanced</button>
          <textarea className="leonardo-states-detail-json"></textarea>
        </div>
      </div>
    )
  }
}


const mapStateToProps = state => {
  const {commonReducer} = state;
  return ({
    selectedState: commonReducer.selectedState
  })
};

export default connect(mapStateToProps)(EditOption);
