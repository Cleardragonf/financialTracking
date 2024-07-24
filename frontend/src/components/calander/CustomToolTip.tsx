import React from 'react';
import moment from 'moment';

interface CustomEvent {
  title: string;
  start: Date;
  end: Date;
  type: string;
}

interface CustomTooltipProps {
  event: CustomEvent | null;
  style?: React.CSSProperties;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ event, style }) => {
  if (!event) return null;

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'absolute',
      zIndex: 1000,
      ...style,
    }}>
      <strong>{event.title}</strong>
      <div>Date: {moment(event.start).format('MMM D, YYYY')}</div>
      <div>Type: {event.type}</div>
    </div>
  );
};

export default CustomTooltip;
