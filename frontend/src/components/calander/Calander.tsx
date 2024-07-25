import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay, parseISO } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Transaction } from '../../App';
import { BalanceWrapper } from './BalanceWrapper';

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

// Function to determine color and text color based on the type of event
const getEventStyles = (type: string) => {
  switch (type) {
    case 'Payday':
      return { backgroundColor: 'green', color: 'white' };
    case 'Expense':
      return { backgroundColor: 'red', color: 'white' };
    case 'Credit Card Payment':
      return { backgroundColor: 'yellow', color: 'black' };
    default:
      return { backgroundColor: 'grey', color: 'white' };
  }
};

export const InteractiveCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // months are zero-based
        
        // Optionally, fetch transactions for the next 12 months
        const monthsToFetch = Array.from({ length: 12 }, (_, i) => month + i);
  
        const responses = await Promise.all(
          monthsToFetch.map(m => 
            axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${m % 12 || 12}`)
          )
        );
  
        // Flatten the array of transactions
        const transactions = responses.flatMap(response => response.data);
  
        // Map and format the events
        const events = transactions.map(event => {
          const startDate = startOfDay(parseISO(event.date));
          const endDate = endOfDay(startDate); // Assuming one-day events
  
          return {
            title: `${event.title} - $${event.amount}`,
            start: startDate,
            end: endDate,
            type: event.type // Include the event type for styling
          };
        });
        setEvents(events);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchEvents();
  }, []);

  // Style events based on their type
  const eventStyleGetter = (event: any) => {
    const { backgroundColor, color } = getEventStyles(event.type);
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '0px',
        opacity: 0.8,
        border: 'none',
      },
    };
  };

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter} // Apply the event styles
      />
    </div>
  );
};
