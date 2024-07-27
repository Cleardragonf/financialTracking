import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Icon.css';

interface IconProps {
  type: string;
}

const Icon: React.FC<IconProps> = ({ type }) => {
  return <i className={`fa fa-${type}`} />;
};


export default Icon;
