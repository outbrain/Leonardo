import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as React from 'react'
import State from './State'
interface StatesProps {
  items: any[];
  dispatch: Dispatch<{}>;
}

class States extends React.Component<StatesProps, any> {
  render() {
    const { items } = this.props;
    const states = items.map((item, i) => {
      return (
        <State item={item} key={i}/>
      )
    })
    return (
      <div>
        {states}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return ({
    items: state.reducers.items
})};

export default connect(mapStateToProps)(States);