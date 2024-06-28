require('dotenv').config();
const express = require('express');
const app = express();
const connectToMongoDB = require('./database/db');

const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const moviesRoutes = require('./routes/movie.routes');
const ticketRoutes = require('./routes/booking.routes');
const screenRoutes = require('./routes/screen.routes');

connectToMongoDB();
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());



app.get('/', (req, res) => res.send("Hey!"));
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/movie', moviesRoutes);
app.use('/ticket', ticketRoutes)
app.use('/screen', screenRoutes);

app.listen( process.env.PORT, () => {console.log(`listening on port ${process.env.PORT}`)});