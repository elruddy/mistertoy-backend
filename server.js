import express from 'express';

//import { toyService } from './services/toy.service.js';
//import { loggerService } from './services/logger.service.js';

const app = express();
app.use(express.static('public'));

app.get('/api/toy/save', (req, res) => {
	const { id: _id, vendor, speed } = req.query;
	const toy = { _id, vendor, speed: +speed };

	toyService
		.save(toy)
		.then((toy) => res.send(toy))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

app.get('/api/toy', (req, res) => {
	toyService.query().then((toys) => res.send(toys));
});

app.get('/api/toy/:id', (req, res) => {
	const toyId = req.params.id;
	toyService
		.getById(toyId)
		.then((toy) => res.send(toy))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

app.get('/api/toy/:id/remove', (req, res) => {
	const toyId = req.params.id;

	toyService
		.remove(toyId)
		.then(() => res.send('OK'))
		.catch((err) => {
			loggerService.error(err);
			res.status(404).send(err);
		});
});

const port = 3030;
app.listen(port, () =>
	loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
);
