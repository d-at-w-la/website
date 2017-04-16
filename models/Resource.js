var async = require('async');
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Resources Model
 * ===========
 */

var Resource = new keystone.List('Resource', {
	map: { name: 'title' },
	track: true,
	autokey: { path: 'slug', from: 'title', unique: true }
});

Resource.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true },
	image: { type: Types.CloudinaryImage },
	description: { type: Types.Html, wysiwyg: true, height: 150 },
	relatedPost: {type: Types.Relationship, ref: 'Post'},
	categories: { type: Types.Relationship, ref: 'ResourceCategory', many: true }
});

/**
 * Virtuals
 * ========
 */

Resource.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});


/**
 * Relationships
 * =============
 */

Resource.relationship({ ref: 'ResourceComment', refPath: 'resource', path: 'comments' });


/**
 * Notifications
 * =============
 */

/*Resource.schema.methods.notifyAdmins = function(callback) {
	var Resource = this;
	// Method to send the notification email after data has been loaded
	var sendEmail = function(err, results) {
		if (err) return callback(err);
		async.each(results.admins, function(admin, done) {
			new keystone.Email('admin-notification-new-Resource').send({
				admin: admin.name.first || admin.name.full,
				author: results.author ? results.author.name.full : 'Somebody',
				title: Resource.title,
				keystoneURL: 'http://www.sydjs.com/keystone/Resource/' + Resource.id,
				subject: 'New Resource to SydJS'
			}, {
				to: admin,
				from: {
					name: 'SydJS',
					email: 'contact@sydjs.com'
				}
			}, done);
		}, callback);
	}
	// Query data in parallel
	async.parallel({
		author: function(next) {
			if (!Resource.author) return next();
			keystone.list('User').model.findById(Resource.author).exec(next);
		},
		admins: function(next) {
			keystone.list('User').model.find().where('isAdmin', true).exec(next)
		}
	}, sendEmail);
};*/


/**
 * Registration
 * ============
 */

Resource.defaultSort = '-publishedDate';
Resource.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Resource.register();
