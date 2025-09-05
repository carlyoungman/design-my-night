import { createTheme } from '@mui/material';

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const sixMonthsISO = (): string =>
  new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6).toISOString().slice(0, 10);

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000', paper: '#000' },
    text: { primary: '#fff', secondary: 'rgba(255,255,255,.7)' },
    primary: { main: '#fff' },
  },
  components: {
    // Inline calendar wrapper
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: '100%', // ← full width
          backgroundColor: '#000',
          color: '#fff',

          // Week rows -> true 7-column grid that fills the width
          '& .MuiDayCalendar-weekContainer': {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 7.5,
            padding: 7.5,
          },

          // Weekday labels
          '& .MuiDayCalendar-weekDayLabel': {
            color: 'rgba(255,255,255,.7)',
          },

          // Each day button sizing/padding
          '& .MuiPickersDay-root': {
            width: '100%', // fill the grid cell
            margin: 0, // no side gaps—use the grid gap above
          },
        },
      },
    },

    // Individual day buttons (states)
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            '& path': { display: 'none' },
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24taWNvbiBsdWNpZGUtY2hldnJvbi1kb3duIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: '24px',
            height: '24px',
          },

          // first button = "previous month" (left)
          '& .MuiIconButton-root:first-of-type .MuiSvgIcon-root': {
            transform: 'rotate(90deg)', // down → left
          },

          // second button = "next month" (right)
          '& .MuiIconButton-root:last-of-type .MuiSvgIcon-root': {
            transform: 'rotate(-90deg)', // down → right
          },
        },
      },
    },

    // Month/Year header row
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: { color: '#fff' },
        label: { color: '#fff' },
      },
    },

    // Left/right chevrons in the header
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: '#fff',

          '&.Mui-disabled': { color: 'rgba(255,255,255,0.5)' },
          '&:hover': { backgroundColor: '#FFF', border: '1px solid #fff', color: '#000' }, // your magenta hover
          '&.Mui-selected': {
            // selected state
            backgroundColor: '#FF00FF',
            border: '1px solid #fff',
            color: '#000',
            '&:hover': {
              backgroundColor: '#ff33ff',
              border: '1px solid #fff',
            },
          },
          '&.MuiPickersDay-today': {
            border: '1px solid #fff',
            offset: 'none',
          },
        },
      },
    },
  },
});
