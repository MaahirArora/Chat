const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '********', 
  database: 'chat', 
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database!');
  }
});

const getMessagesQuery = `
  SELECT 
    CASE WHEN sender_id = ? THEN true ELSE false END AS own,
    message_text AS text,
    timestamp
  FROM messages
  WHERE (sender_id = ? AND receiver_id = ?)
     OR (sender_id = ? AND receiver_id = ?)
  ORDER BY timestamp ASC
`;

app.post('/api/getmessage', async (req, res) => {
  const { sender, receiver } = req.body;
  if (!sender || !receiver) {
    return res.status(400).json({ error: 'Sender and receiver are required' });
  }

  try {
    const [senderResult] = await db.promise().query('SELECT id FROM users WHERE username = ?', [sender]);
    if (senderResult.length === 0) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    const sender_id = senderResult[0].id;
    const [receiverResult] = await db.promise().query('SELECT id FROM users WHERE username = ?', [receiver]);
    if (receiverResult.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }
    const receiver_id = receiverResult[0].id;
    const [messages] = await db.promise().query(getMessagesQuery, [sender_id, sender_id, receiver_id, receiver_id, sender_id]);
    res.json({ success: true, messages });
  }
  catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Database error while retrieving messages' });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];     
    if (user && user.password === password) {
      res.json({ token: user.token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Request received:', req.body);
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const token = `sample-token-${rows.length + 1}`;
    console.log(token);
    await db.promise().query('INSERT INTO users (username, email, password, token) VALUES (?, ?, ?, ?)', [username, email, password, token]);
    res.status(201).json({ message: 'User created successfully', token });
  }
  catch (error) {
    console.error('Error inserting into database:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/check', async (req, res) => {
  try {
    const { username } = req.body;

    const [userResults] = await db.promise().query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (userResults.length === 0) {
      // Username not found
      return res.status(404).json({ found: false });
    }

    // Retrieve friends of the user if the username exists
    const [friendRows] = await db.promise().query(
      `SELECT 
         CASE WHEN user1 = ? THEN user2 ELSE user1 END AS friend
       FROM 
         friends
       WHERE 
         user1 = ? OR user2 = ?`,
      [username, username, username]
    );

    // Respond with user ID and their friends
    res.status(200).json({
      found: true,
      id: userResults[0].id,
      friends: friendRows.map(row => row.friend),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


app.post('/api/notifications', async (req, res) => {
  const { user } = req.body;
  try {
    const [notifications] = await db
      .promise()
      .query(
        `SELECT * FROM notifications WHERE user = ? ORDER BY created_at DESC`,
        [user]
      );

    res.json({
      success: true,
      notifications: notifications || [], 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
    });
  }
});

app.post('/api/sendFriendRequest', async (req, res) => {
  const { sender, receiver } = req.body;
  try {
    const [receiverlist] = await db.promise().query('SELECT * FROM users WHERE username = ?', [receiver]);

    if (receiverlist.length === 0) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }
    const [existingRequest] = await db.promise().query(
      'SELECT * FROM friend_requests WHERE sender = ? AND receiver = ?',
      [sender, receiver]
    );

    if (existingRequest.length > 0) {
      return res.status(400).json({ success: false, message: 'Friend request already exists' });
    }
    const [result] = await db.promise().query(
      'INSERT INTO friend_requests (sender, receiver, status) VALUES (?, ?, ?)',
      [sender, receiver, 'pending']
    );
    const requestId = result.insertId;
    console.log('New Request ID:', requestId);
    await db.promise().query(
      'INSERT INTO notifications (user, sender, request_id, type, status) VALUES (?, ?, ?, ?, ?)',
      [receiver, sender, requestId, 'friend_request', 'pending']
    );
    res.json({ success: true, message: 'Friend request sent successfully' });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, message: 'Error sending friend request' });
  }
});

app.post('/api/accept-request', async (req, res) => {
  const { notificationId } = req.body;
  if (!notificationId) {
    return res.status(400).json({ success: false, message: 'Notification ID is required' });
  }

  try {
    const [notification] = await db.promise().query(
      `SELECT * FROM notifications WHERE id = ? AND type = 'friend_request'`,
      [notificationId]
    );
    const sender = notification[0].sender; 
    const receiver = notification[0].user;
    await db.promise().query(
      `INSERT INTO friends (user1, user2) VALUES (?, ?)`,
      [sender, receiver]
    );
    await db.promise().query(
      `UPDATE friend_requests SET status = ? WHERE sender = ? AND receiver = ?`,
      ['accepted', sender, receiver]
    );
    await db.promise().query(
      'INSERT INTO notifications (user, sender, request_id, type, status) values (?,?,?,?,?)',[sender,receiver,notificationId,'message','accepted']
    )
    await db.promise().query(
      `DELETE FROM notifications WHERE id = ?`,
      [notificationId]
    );

    return res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return res.status(500).json({ success: false, message: 'Error accepting friend request' });
  }
});

app.post('/api/message', async (req, res) => {
  const { sender, receiver, message_text } = req.body;
  if (!sender || !receiver || !message_text) {
    return res.status(400).json({ error: 'Sender, receiver, and message text are required' });
  }

  const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
  try {
    const [senderResult] = await db.promise().query(getUserIdQuery, [sender]);
    if (senderResult.length === 0) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    const sender_id = senderResult[0].id;

    const [receiverResult] = await db.promise().query(getUserIdQuery, [receiver]);
    if (receiverResult.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }
    const receiver_id = receiverResult[0].id;
    const insertMessageQuery = `INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)`;
    await db.promise().query(insertMessageQuery, [sender_id, receiver_id, message_text]);
    const [messages] = await db.promise().query(getMessagesQuery, [sender_id, sender_id, receiver_id, receiver_id, sender_id]);
    console.log(messages);
    res.status(201).json({ success: true ,messages });
    //console.log('Response messages:', messages);
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ error: 'Database error while saving the message' });
  }
});

app.post('/api/people', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  try {
    const [friendrows] = await db.promise().query(
      `SELECT 
         CASE WHEN user1 = ? THEN user2 ELSE user1 END AS friend
       FROM 
         friends
       WHERE 
         user1 = ? OR user2 = ?`,
      [username, username, username]
    );
    const friends = friendrows.map((row, index) => ({
      id: index + 1, // Assign a unique ID
      name: row.friend, // Username
    }));
    

    res.status(200).json(friends); 
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ success: false, message: 'Error fetching friends' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
