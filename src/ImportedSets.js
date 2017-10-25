import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { graphql, gql, compose } from 'react-apollo';
import cx from 'classnames';

import SortBy from './SortBy';
import Scrollable from './Scrollable';
import Cards from './Cards';
import CountBadge from './CountBadge';
import SetListItem from './SetListItem';

class ImportedSets extends Component {
  render() {
    const { sets, setsByCode, mtgJsonSets } = this.props;

    if (sets.loading) {
      return 'Loading...';
    }

    return (
      <div className="d-flex h-100">
        <div className="pr-3 w-50">
          <SortBy
            items={sets.allSets}
            options={['meta.count', 'releaseDate', 'name', 'type']}>
            {({ items, form }) => {
              const header = (
                <div className="bg-white pb-2">
                  <h5>
                    Imported Sets{' '}
                    <span className="badge badge-dark">
                      {items.length}/{mtgJsonSets.length}
                    </span>
                  </h5>
                  {form}
                </div>
              );

              return (
                <Scrollable header={header}>
                  <ul className="list-group">
                    {items.map(set => {
                      const { count } = set.meta;
                      // const active = set.code === setCode;
                      const total = setsByCode[set.code]
                        ? setsByCode[set.code].cards.length
                        : 0;

                      return (
                        <li
                          key={set.id}
                          className={cx('list-group-item', {
                            // 'bg-light': active
                          })}>
                          <SetListItem
                            name={set.name}
                            type={set.type}
                            to={`/sets/${set.id}/${set.code}`}>
                            <CountBadge count={count} total={total} />
                          </SetListItem>
                        </li>
                      );
                    })}
                  </ul>
                </Scrollable>
              );
            }}
          </SortBy>
        </div>
        <div className="px-3 w-50">
          <Route
            path="/sets/:setId/:setCode"
            render={props => <Cards setsByCode={setsByCode} {...props} />}
          />
        </div>
      </div>
    );
  }
}

export const setFragment = gql`
  fragment SetItem on Set {
    id
    name
    code
    type
    releaseDate
    meta: _cardsMeta {
      count
    }
  }
`;

export const setsQuery = gql`
  query {
    allSets {
      ...SetItem
    }
  }
  ${setFragment}
`;

const withAllSets = graphql(setsQuery, {
  name: 'sets'
});

export default compose(withAllSets)(ImportedSets);
