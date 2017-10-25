import React from 'react';
import cx from 'classnames';

const CountBadge = ({ count = 0, total = 0 }) => {
  const isComplete = count === total;
  const isOver = count > total;

  return (
    <span
      className={cx('badge', {
        'badge-warning': isOver && !isComplete,
        'badge-danger': !isComplete && !isOver,
        'badge-success': isComplete
      })}>
      {count}/{total}
    </span>
  );
};

export default CountBadge;
