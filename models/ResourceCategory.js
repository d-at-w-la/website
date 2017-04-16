var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Resource Categories Model
 * =====================
 */

var ResourceCategory = new keystone.List('ResourceCategory', {
	track: true,
	autokey: { from: 'name', path: 'key', unique: true }
});

ResourceCategory.add({
	name: { type: String, required: true },
	tagline: { type: String}
});


/**
 * Relationships
 * =============
 */

ResourceCategory.relationship({ ref: 'Resource', refPath: 'categories', path: 'resources' });


/**
 * Registration
 * ============
 */

ResourceCategory.register();
