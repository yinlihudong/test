function toDate(value) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Invalid date value");
  }

  return date;
}

function pad(value, length) {
  return String(value).padStart(length, "0");
}

function formatDate(value, pattern = "YYYY-MM-DD", useUTC = false) {
  const date = toDate(value);

  const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
  const month = useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1;
  const day = useUTC ? date.getUTCDate() : date.getDate();
  const hour = useUTC ? date.getUTCHours() : date.getHours();
  const minute = useUTC ? date.getUTCMinutes() : date.getMinutes();
  const second = useUTC ? date.getUTCSeconds() : date.getSeconds();
  const millisecond = useUTC ? date.getUTCMilliseconds() : date.getMilliseconds();

  const tokens = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: pad(month, 2),
    M: String(month),
    DD: pad(day, 2),
    D: String(day),
    HH: pad(hour, 2),
    H: String(hour),
    mm: pad(minute, 2),
    m: String(minute),
    ss: pad(second, 2),
    s: String(second),
    SSS: pad(millisecond, 3),
  };

  return pattern.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS/g, (token) => tokens[token]);
}

module.exports = {
  formatDate,
};
