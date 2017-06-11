import { expect } from 'chai';
import mongoose from 'mongoose';
mongoose.Promise = Promise;

import { MongooseValidatorjs } from '../src/mongoose-validatorjs';

describe('Mongoose Validator:', () => {
	let User, doc, schema;

	before(done => {
		const url = 'mongodb://127.0.0.1/mongoose_validatorjs_test';
		const date = Date.now();

		const email = { type: String, default: null };
		const roles = { type: Array, default: [] };
		const age = { type: Number, default: null };
		const date_created = { type: Date, default: date };

		mongoose.connect(url);

		schema = new mongoose.Schema({ email, roles, age, date_created });
		User = mongoose.model('User', schema);
		done();
	});

	after(done => {
		mongoose.connection.db
			.dropDatabase()
			.then(() => {
				mongoose.disconnect().then(done, done);
			});
	});

	afterEach(done => {
		// Remove the attached validators from tests
		schema.paths.email.validators = [];
		schema.paths.roles.validators = [];
		schema.paths.age.validators = [];
		schema.paths.date_created.validators = [];
		done();
	});

	describe('schema', () => {

		it('new instance', () => {
			let validate = new MongooseValidatorjs(schema);
			expect(validate).to.have.property('_schema');
			expect(validate).to.be.an.instanceof(MongooseValidatorjs);
		});

		it('get schema', () => {
			let validate = new MongooseValidatorjs(schema);
			expect(validate.getSchema()).to.equal(schema);
		});

	});

	describe('field', () => {

		it('field()', () => {
			let validate = new MongooseValidatorjs(schema);
			expect(validate.field('email')).to.be.an('object');
		});

	});

	describe('required', () => {

		beforeEach(() => {
			let validate = new MongooseValidatorjs(schema);
			validate.field('email').required();
		});

		describe('should raise an error when a required field is', () => {

			it('an empty string', () => {
				let model = new User({ email: '' });
				let error = model.validateSync();
				expect(error).to.not.be.undefined;
				expect(error.errors).to.have.property('email');
			});

			it('null', () => {
				let model = new User({ email: null });
				let error = model.validateSync();
				expect(error).to.not.be.undefined;
				expect(error.errors).to.have.property('email');
			});

			it('undefined', () => {
				let model = new User;
				let error = model.validateSync();
				expect(error).to.not.be.undefined;
				expect(error.errors).to.have.property('email');
			});

		});

		describe('should raise no errors when a required field is filled with', () => {

			it('a string', () => {
				let model = new User({ email: 'email@gmail.com' });
				let error = model.validateSync();
				expect(error).to.be.undefined;
			});

			it('a number', () => {
				let model = new User({ email: 65 });
				let error = model.validateSync();
				expect(error).to.be.undefined;
			});

			it('a wrong type', () => {
				let model = new User({ email: new Date() });
				let error = model.validateSync();
				expect(error).to.be.undefined;
			});

		});

	});


});
