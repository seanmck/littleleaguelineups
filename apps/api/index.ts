import express from 'express';
const app = express();
app.use(express.json());

app.get('/teams', (req, res) => {
  // Later: fetch from DB
  res.json([{ id: 'demo', name: 'Red Rockets' }]);
});

app.listen(3000, () => console.log('API listening on port 3000'));
