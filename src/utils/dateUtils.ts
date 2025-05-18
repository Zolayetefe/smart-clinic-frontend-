export const categorizeAppointments = (appointments: any[]) => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  return {
    today: appointments.filter(app => {
      const appDate = new Date(app.dateTime);
      return appDate.toDateString() === now.toDateString();
    }),
    upcoming: appointments.filter(app => {
      const appDate = new Date(app.dateTime);
      return appDate > now;
    }),
    past: appointments.filter(app => {
      const appDate = new Date(app.dateTime);
      return appDate < now;
    })
  };
};

export const formatAppointmentDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}; 