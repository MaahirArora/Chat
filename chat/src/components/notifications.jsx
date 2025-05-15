import React, { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationDrawer = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        });

        const data = await response.json();

        if (data.success) {
          setNotifications(data.notifications || []);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching notifications');
      }
    };

    fetchNotifications();
  }, [user]);

  const handleAccept = async (notificationId) => {
    try {
      const response = await fetch('http://localhost:5000/api/accept-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('Content-Type'));
      const text = await response.text();
      console.log('Response body:', text);
      
      const data = JSON.parse(text); // If you're sure it's JSON
      if (data.success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      }
      
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleDeny = async (notificationId) => {
    try {
      const response = await fetch('http://localhost:5000/api/deny-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Error denying request:', err);
    }
  };

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <NotificationsIcon style={{ color: 'grey' }} />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <div style={{ width: 300, padding: '16px' }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <Divider />
          <List>
            {Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem key={notification.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <PersonIcon />
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.sender}
                    secondary={
                      notification.type === 'friend_request' ? (
                        <div>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.sender} has sent you a friend request
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ marginTop: '8px' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleAccept(notification.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              onClick={() => handleDeny(notification.id)}
                            >
                              Deny
                            </Button>
                          </Stack>
                        </div>
                      ) : notification.status === 'rejected' ? (
                        `${notification.sender} has denied your request`
                      ) : (
                        `${notification.sender} has accepted your request`
                      )
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography>No Notifications!</Typography>
            )}
          </List>

          <Divider />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => alert('Notifications cleared!')}
            style={{ marginTop: '16px' }}
          >
            Clear All
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default NotificationDrawer;
