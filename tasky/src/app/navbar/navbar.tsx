import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

interface NavbarProps {
  username: string;
  handleLogout: () => void;
}

const Navbar = ({ username, handleLogout }: NavbarProps) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#0bb4ca' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* App Title */}
        <Typography variant="h6" component="div">
          Tasky
        </Typography>

        {/* Username Display */}
        <Box>
          <Typography variant="body1" component="span" sx={{ marginRight: '15px' }}>
            Hello, {username}
          </Typography>
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="contained"
            color="secondary"
            sx={{ marginBottom: '15px', marginTop: '10px' }}
          >
            <Link href="/login">Logout</Link>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
