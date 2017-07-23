import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import * as React from 'react'
import State from './State'
import './States.less'

interface StatesProps {
  filterValue: string,
  items: any[];
  dispatch: Dispatch<{}>;
}

class States extends React.Component<StatesProps, any> {
  private setFilter(event) {
    this.props.dispatch({type: 'SET_FILTER', filterValue: event.target.value.toLowerCase()});
  }

  transformStates(items) {
    return items
      .map((item, i) => {
        return (
          <State item={item} key={i}/>
        )
      });
  }

  render() {
    const {items} = this.props;
    const states = this.transformStates(items);
    return (
      <div className="states-list">
        <div className="states-bar">
          <input className="search-state"
                 name="search-state"
                 type="text"
                 onChange={this.setFilter.bind(this)}
                 placeholder="Search..."/>
        </div>
        {states}
      </div>
    );
  }
}

const filterItems = (items, filter) => {
  return items.filter(item => !filter || item.name.toLowerCase().includes(filter))
};

const mapStateToProps = state => {
  return ({
    items: filterItems(state.reducers.items, state.reducers.filterValue)
  })
};



export default connect(mapStateToProps)(States);