import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay, parseISO } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Transaction } from '../../App';

// Setup date-fns localizer
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const InteractiveCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // months are zero-based

    axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`)
      .then(response => {
        const events = response.data.map(event => {
          // Parse the date string and adjust for local time zone
          const startDate = startOfDay(parseISO(event.date));
          const endDate = endOfDay(startDate); // Assuming one-day events

          return {
            title: `${event.title} - $${event.amount}`,
            start: startDate,
            end: endDate,
          };
        });
        setEvents(events);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
};
