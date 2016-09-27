const express    = require('express');

export const api_router = express.Router();

api_router.get('/', (req, res)=>{
  res.render('index.ejs', {
		content: 'Hello World!'
	});
});
