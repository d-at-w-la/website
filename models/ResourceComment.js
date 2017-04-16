var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Comments Model
 * ===================
 */

var ResourceComment = new keystone.List('ResourceComment', {
	nocreate: true
});

ResourceComment.add({
	resource: { type: Types.Relationship, ref: 'Resource', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	date: { type: Types.Date, default: Date.now, index: true },
	content: { type: Types.Markdown }
});


/**
 * Registration
 * ============
 */

ResourceComment.defaultColumns = 'resource, author, date|20%';
ResourceComment.register();
