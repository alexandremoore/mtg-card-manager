import React, { Component } from 'react';
import sortBy from 'lodash/sortBy';

export default class SortBy extends Component {
  state = {
    value: ''
  };
  componentDidMount() {
    if (this.props.options) {
      this.setState({
        value: this.props.options[0]
      });
    }
  }
  render() {
    const { items, options = [] } = this.props;
    const { value } = this.state;

    const Form = (
      <form className="mb-3 form form-inline">
        <label className="mr-2">Sort by</label>
        <select
          className="form-control form-control-sm"
          value={this.state.value}
          onChange={e => this.setState({ value: e.target.value })}>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </form>
    );

    return this.props.children({
      items: sortBy(items, value) || [],
      form: Form
    });
  }
}
