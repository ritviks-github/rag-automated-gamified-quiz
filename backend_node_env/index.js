const express = require('express');
const cors = require('cors');
require('./db');







const app = express();

app.use(express.json());
app.use(cors());
app.use('/api',require('./routes/sign_user'));
app.use('/api',require('./routes/log_user'));
app.use('/api',require('./routes/create_quiz'));
app.use('/api',require('./routes/update_quiz'));
app.use('/api',require('./routes/get_quiz_prof_persistent'));
app.use('/api',require('./routes/get_all_quiz_prof'));
app.use('/api',require('./routes/get_idx_quiz'));
app.use('/api',require('./routes/submit-quiz'));
app.use('/api',require('./routes/check_attempted_quiz'));















const port = 8080;
const server = app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})