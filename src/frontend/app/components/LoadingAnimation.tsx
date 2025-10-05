import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000', paper: '#000' },
    text: { primary: '#fff', secondary: alpha('#fff', 0.7) },
  },
  components: {
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#fff', 0.12),
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.25)}, transparent)`,
          },
        },
      },
    },
  },
});

export default function LoadingAnimation({ text, type }: { text?: string; type?: string }) {
  return (
    <ThemeProvider theme={theme}>
      <Box className={`loading-animation${type ? ` loading-animation--${type}` : ''}`}>
        {text && <p className="loading-animation__text">{text}</p>}
        <Skeleton
          animation="wave"
          sx={{
            borderRadius: 0,
            mb: 'var(--universal-space)',
            height: 'var(--universal-space)',
          }}
        />
        <Skeleton
          animation="wave"
          sx={{
            borderRadius: 0,
            mb: 'var(--universal-space)',
            height: 'var(--universal-space-2)',
          }}
        />
        <Skeleton animation="wave" sx={{ borderRadius: 0, height: 'var(--universal-space)' }} />
      </Box>
    </ThemeProvider>
  );
}
