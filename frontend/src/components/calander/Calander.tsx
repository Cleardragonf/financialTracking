import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfDay, endOfDay, parseISO, lastDayOfMonth } from 'date-fns';
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

// Adjust date to the last day of the month if it falls outside the month's range
const adjustDateToLastDayOfMonth = (date: Date) => {
  const lastDay = lastDayOfMonth(date);
  if (date.getDate() > lastDay.getDate()) {
    return lastDay;
  }
  return date;
};

// Function to determine color based on the type of event
const getEventColor = (type: string) => {
  switch (type) {
    case 'Payday':
      return 'green';
    case 'Expense':
      return 'red';
    case 'Credit Card Payment':
      return 'yellow';
    default:
      return 'grey';
  }
};

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
        let startDate = startOfDay(parseISO(event.date));
        const lastDay = lastDayOfMonth(startDate);

        // Adjust date if it falls outside the valid range of the month
        if (startDate.getDate() > lastDay.getDate()) {
          console.log(`Adjusting date: ${startDate.toISOString()} to last day of month`);
          startDate = adjustDateToLastDayOfMonth(startDate);
        } else {
          console.log(`Date is valid within the month: ${startDate.toISOString()}`);
        }

        const endDate = endOfDay(startDate); // Assuming one-day events

        return {
          title: `${event.title} - $${event.amount}`,
          start: startDate,
          end: endDate,
          color: getEventColor(event.type) // Set the color based on event type
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

  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color;
    const color = backgroundColor === 'yellow' ? 'black' : 'white'; // Change font color to black for yellow background
    return {
      style: {
        backgroundColor,
        borderRadius: '0px',
        opacity: 0.8,
        color, // Set font color based on the background color
        border: 'none',
      },
    };
  };

  return (
    <div style={{ height: '80vh' }}>
      <BalanceWrapper date={viewDate} /> {/* Pass the viewDate to BalanceWrapper */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};
