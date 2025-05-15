import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const FormDialog = ({ open, onClose, sender }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/sendFriendRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: sender,
                    receiver: name,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Friend request sent successfully!');
            } else {
                console.error('Error sending friend request:', data.message);
            }

            onClose(); 
            setName('');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Send Invitation</DialogTitle>
            <DialogContent>
                <TextField
                    value={name}
                    autoFocus
                    margin="dense"
                    label="Enter username"
                    type="text"
                    fullWidth
                    variant="outlined"
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    disabled={loading || !name}
                >
                    {loading ? 'Sending...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FormDialog;
