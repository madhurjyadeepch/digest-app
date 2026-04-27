const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config('../.env');

const PORT = process.env.PORT || 3000;

app.use(express.json());

const authRoutes = require('./routes/authRoutes.js');
//const feedRoutes = require('./routes/feedRoutes.js');

app.get('/test', (req, res) => {
    res.json({message: 'Digest app is running smoothly'});
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})