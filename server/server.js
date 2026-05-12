const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('../qalam-6a381-firebase-adminsdk-fbsvc-5bb7b2ffa4.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware for authentication
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (req.user.email !== 'geektyle8@gmail.com') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// Routes

// Sync User on Login
app.post('/api/users/sync', verifyAuth, async (req, res) => {
  try {
    const { name, email, picture, uid } = req.body;
    const role = email === 'geektyle8@gmail.com' ? 'admin' : 'user';
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      await userRef.set({
        name, email, picture, uid, role,
        bio: '', joinedDate: new Date().toISOString(),
        totalPosts: 0, totalComments: 0, rating: 0, followers: 0, following: 0
      });
    }
    const userData = (await userRef.get()).data();
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Posts (Public)
app.get('/api/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').where('status', '==', 'published').get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const doc = await db.collection('posts').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post Requests (User Dashboard)
app.post('/api/requests', verifyAuth, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      uid: req.user.uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('requests').add(requestData);
    res.status(201).json({ id: docRef.id, ...requestData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requests/me', verifyAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('requests').where('uid', '==', req.user.uid).get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/stats', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const usersCount = (await db.collection('users').count().get()).data().count;
    const postsCount = (await db.collection('posts').count().get()).data().count;
    res.status(200).json({ usersCount, postsCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Approve Request
app.post('/api/admin/requests/:id/approve', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const requestRef = db.collection('requests').doc(req.params.id);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) return res.status(404).json({ error: 'Not found' });
    
    const requestData = requestDoc.data();
    
    // Create Post
    const postData = {
      ...requestData,
      status: 'published',
      publishDate: new Date().toISOString()
    };
    delete postData.createdAt;
    
    const postRef = await db.collection('posts').add(postData);
    
    // Update Request
    await requestRef.update({ status: 'approved', postId: postRef.id });
    
    // Increment User totalPosts
    const userRef = db.collection('users').doc(requestData.uid);
    await userRef.update({ totalPosts: admin.firestore.FieldValue.increment(1) });
    
    res.status(200).json({ message: 'Approved successfully', postId: postRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comments
app.post('/api/posts/:id/comments', verifyAuth, async (req, res) => {
  try {
    const commentData = {
      postId: req.params.id,
      uid: req.user.uid,
      content: req.body.content,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('comments').add(commentData);
    res.status(201).json({ id: docRef.id, ...commentData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
