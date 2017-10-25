import React from 'react';
import { Link } from 'react-router-dom';

const SetListItem = ({ name, type, to, children }) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="pr-3">
        {to ? <Link to={to}>{name}</Link> : name}
        <br />
        <small>{type}</small>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default SetListItem;
