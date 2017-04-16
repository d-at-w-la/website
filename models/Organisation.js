var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Organisations Model
 * ===================
 */

var Organisation = new keystone.List('Organisation', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true }
});

Organisation.add({
	name: { type: String, index: true },
	logo: { type: Types.CloudinaryImage },
	website: Types.Url,
	isHiring: Boolean,
	description: { type: Types.Markdown },
	location: {type: Types.Location, defaults:{
		country: 'United States',
		state: 'CA',
		city: 'Los Angeles'
	}}
});


/**
 * Relationships
 * =============
 */

Organisation.relationship({ ref: 'User', refPath: 'organisation', path: 'members' });


/**
 * Registration
 * ============
 */

Organisation.defaultColumns = 'name, website, isHiring';
Organisation.register();
