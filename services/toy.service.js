import fs from 'fs';
import { utilService } from './util.service.js';
import { loggerService } from './logger.service.js';

export const toyService = {
	query,
	getById,
	remove,
	save,
};

const PAGE_SIZE = 5;
const toys = utilService.readJsonFile('data/toy.json');

function query(filterBy = { txt: '', maxPrice: '', inStock: 'All', sort: '' }) {
	const regex = new RegExp(filterBy.txt, 'i');
	var toysToReturn = toys.filter((toy) => regex.test(toy.name));

	if (filterBy.maxPrice) {
		toys = toys.filter((toy) => toy.price <= filterBy.maxPrice);
	}

	if (filterBy.inStock && filterBy.inStock !== 'All') {
		toys = toys.filter((toy) =>
			filterBy.inStock === 'In stock' ? toy.inStock : !toy.inStock
		);
	}

	if (filterBy.sort) {
		if (filterBy.sort === 'name') {
			toys = toys.sort((a, b) => a.name.localeCompare(b.name));
		} else if (filterBy.sort === 'createdAt') {
			toys = toys.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		} else if (filterBy.sort === 'price') {
			toys = toys.sort((a, b) => a.price - b.price);
		}
	}
	return Promise.resolve(toysToReturn);
}

function getById(toyId) {
	const toy = toys.find((toy) => toy._id === toyId);
	return Promise.resolve(toy);
}

function remove(toyId, loggedinUser) {
	const idx = toys.findIndex((toy) => toy._id === toyId);
	if (idx === -1) return Promise.reject('No Such Toy');

	const toy = toys[idx];
	if (!loggedinUser.isAdmin && toy.owner._id !== loggedinUser._id) {
		return Promise.reject('Not your toy');
	}
	toys.splice(idx, 1);
	return _saveToysToFile();
}

function save(toy, loggedinUser) {
	if (toy._id) {
		const toyToUpdate = toys.find((currToy) => currToy._id === toy._id);
		if (!loggedinUser.isAdmin && toyToUpdate.owner._id !== loggedinUser._id) {
			return Promise.reject('Not your toy');
		}
		toyToUpdate.name = toy.name;

		toyToUpdate.price = toy.price;
		toy = toyToUpdate;
	} else {
		toy._id = utilService.makeId();
		toy.owner = loggedinUser;
		toys.push(toy);
	}
	delete toy.owner.score;
	return _saveToysToFile().then(() => toy);
}

function _saveToysToFile() {
	return new Promise((resolve, reject) => {
		const data = JSON.stringify(toys, null, 2);
		fs.writeFile('data/toy.json', data, (err) => {
			if (err) {
				loggerService.error('Cannot write to toys file', err);
				return reject(err);
			}
			resolve();
		});
	});
}
