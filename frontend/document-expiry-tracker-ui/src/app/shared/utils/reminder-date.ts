type ReminderWindow = {
  date: string;
  expiryDate: string;
  dismissed: boolean;
};

function localIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function activeReminderCount(reminders: ReminderWindow[], today = new Date()): number {
  const currentDate = localIsoDate(today);
  return reminders.filter(
    (reminder) =>
      !reminder.dismissed &&
      !!reminder.date &&
      !!reminder.expiryDate &&
      reminder.date <= currentDate &&
      currentDate <= reminder.expiryDate,
  ).length;
}
