import * as React from 'react';
import './OptionEdit.less';
import {useInput} from '../../common/Hooks/useInput';
import {useEffect} from 'react';

export function OptionEdit({state, onDataChanged = undefined}) {

  const option = state.activeOption || state.options[0];
  if (!option) {
    return <div className="option-edit-container">No option selected.</div>
  }
  const { value: status, bind: bindStatus } = useInput(option.status);
  const { value: delay, bind: bindDelay } = useInput(option.delay);
  const { value: response, bind: bindResponse } = useInput(JSON.stringify(option.data, null, 2));

  const parseResponse = res => {
    let result = res;
    try {
      result = JSON.parse(res);
    } catch {}
    return result;
  };

  useEffect(() => {
    option.status = parseInt(status);
    option.delay= parseInt(delay);
    option.data = parseResponse(response);
    onDataChanged({
      isValid: true,
      data: state
    });
  }, [status, delay, response]);

  return (
    <div className="option-edit-container">
      <div className="option-edit-title">{state.name}</div>
      <div className="option-edit-sub-title">Edit Option <b>{option.name}</b></div>
      <form className="option-edit-form">
        <div className="form-group option-edit-source">
          <label>Source</label>
          <div className="form-input">{option.from_local ? 'Local Storage' : 'Code'}</div>
        </div>
        <div className="form-group option-edit-status">
          <label>Status</label>
          <div className="form-input">
            <input type="number" {...bindStatus} />
          </div>
        </div>
        <div className="form-group option-edit-delay">
          <label>Delay (ms)</label>
          <div className="form-input">
            <input type="number" step="100" {...bindDelay} />
          </div>
        </div>
        <div className="form-group option-edit-response">
          <label>Response</label>
          <div className="form-input">
            <textarea {...bindResponse} />
          </div>
        </div>
      </form>
    </div>
  )
}
