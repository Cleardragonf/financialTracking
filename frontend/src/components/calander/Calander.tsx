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
  const [viewDate, setViewDate] = useState(new Date()); // State to track the current view date

  const fetchEvents = async (year: number, month: number) => {
    try {
      // Fetch transactions for the given year and month
      const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`);
      const transactions = response.data;

      // Deduplicate transactions based on a unique identifier
      const uniqueTransactions = Array.from(
        new Map(transactions.map(transaction => [transaction._id, transaction])).values()
      );

      // Map and format the events
      const formattedEvents = uniqueTransactions.map(event => {
        const startDate = startOfDay(parseISO(event.date));
        const endDate = endOfDay(startDate); // Assuming one-day events

        return {
          title: `${event.title} - $${event.amount}`,
          start: startDate,
          end: endDate,
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1; // months are zero-based

    fetchEvents(year, month);
  }, [viewDate]);

  const handleViewChange = (view: any) => {
    console.log('View changed to:', view);
    // Handle view change if needed
  };

  const handleNavigate = (date: Date) => {
    setViewDate(date);
  };

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onNavigate={handleNavigate}
        onView={handleViewChange}
      />
    </div>
  );
};
