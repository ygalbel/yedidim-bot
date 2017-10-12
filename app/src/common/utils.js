import dateFormat from 'dateformat';

export const objectToArray = (obj) => {
  let arr = [];
  for (const key in obj){
    if (obj.hasOwnProperty(key)) {
      let item = obj[key];
      item.key = key;
      arr.push(item);
    }
  }
  return arr;
};

export const getCopyText = (event) => {
  return `*שם:* ${event.details['caller name']}\r\n*טלפון:* ${event.details['phone number']}\r\n*בעיה:* ${formatEventCase(event)}\r\n*פרטים:* ${event.details['more']}\r\n*סוג רכב:* ${event.details['car type']}\r\n*כתובת:* ${event.details['address']}`;
};


export const formatEventCase = (event) => {
  if (!event.details.case && event.details.case !== 0){
    return 'לא ידוע';
  }
  const cases = ['כבלים', 'פנצ\'ר', 'קומפרסור', 'דלת נעולה', 'שמן\\מים\\דלק', 'חילוץ', 'קודנית', 'פנצ\'ר (אין רזרבי)', 'אחר'];
  return cases[event.details.case];
};

export const formatEventTime = (event) => {
  return dateFormat(new Date(event.timestamp), "d/m HH:MM");
};

export const getEventStatus = (event) => {
  return event.status;
};