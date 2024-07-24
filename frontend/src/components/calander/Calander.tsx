// src/components/BigCalendar.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

// Define the type for your event data
interface Event {
  _id: {
    $oid: string;
  };
  title: string;
  amount: number;
  date: string;
  notes: string;
  type: string;
  __v: number;
}

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

    axios.get<Event[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`)
      .then(response => {
        const events = response.data.map(event => ({
          title: `${event.title} - $${event.amount}`,
          start: new Date(event.date),
          end: new Date(event.date), // Assuming all events are one-day events
        }));
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
