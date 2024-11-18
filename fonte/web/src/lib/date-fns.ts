import { add, format as dateFnsFormat, FormatOptions } from 'date-fns'

export const format = (
  date: string | Date,
  format: string,
  options?: FormatOptions,
) => dateFnsFormat(add(date, { hours: 3 }), format, options)
