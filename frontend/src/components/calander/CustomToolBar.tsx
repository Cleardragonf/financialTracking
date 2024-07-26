import React, { useState, useEffect } from 'react';
import { ToolbarProps } from 'react-big-calendar';
import './CustomToolBar.css'; // Import the CSS file for styling

const CustomToolbar: React.FC<ToolbarProps> = (props) => {
  const [currentView, setCurrentView] = useState<string>('month');
  const [displayDate, setDisplayDate] = useState<string>('');

  useEffect(() => {
    const formatDate = (date: Date, view: string) => {
      if (view === 'day') {
        return date.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
    };

    setDisplayDate(formatDate(props.date, currentView));
  }, [props.date, currentView]);

  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToToday = () => {
    props.onNavigate('TODAY');
  };

  const goToMonthView = () => {
    props.onView('month');
    setCurrentView('month');
  };

  const goToWeekView = () => {
    props.onView('week');
    setCurrentView('week');
  };

  const goToDayView = () => {
    props.onView('day');
    setCurrentView('day');
  };

  const goToAgendaView = () => {
    props.onView('agenda');
    setCurrentView('agenda');
  };

  return (
    <div className="custom-toolbar">
      <div className="toolbar-header">
        <button className="nav-button" onClick={goToBack}>
          &lt;
        </button>
        <span className="current-month">{displayDate}</span>
        <button className="nav-button" onClick={goToNext}>
          &gt;
        </button>
      </div>
      <div className="view-buttons">
        <button className='view-button' onClick={goToToday}>
          Today
        </button>
        <button className="view-button" onClick={goToMonthView}>
          Month
        </button>
        <button className="view-button" onClick={goToWeekView}>
          Week
        </button>
        <button className="view-button" onClick={goToDayView}>
          Day
        </button>
        <button className="view-button" onClick={goToAgendaView}>
          Agenda
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar;
