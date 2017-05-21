var _ = require('lodash');
var keystone = require('keystone');
var moment = require('moment');
var Types = keystone.Field.Types;

/**
 * Meetups Model
 * =============
 */

var Meetup = new keystone.List('Meetup', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true }
});

Meetup.add({
	name: { type: String, required: true, initial: true },
	publishedDate: { type: Types.Date, index: true },

	state: { type: Types.Select, options: 'draft, scheduled, active, past', noedit: true },

	startDate: { type: Types.Datetime, required: true, initial: true, index: true, width: 'short', note: 'e.g. 2014-07-15 / 6:00:00 pm' },
	endDate: { type: Types.Datetime, required: true, initial: true, index: true, width: 'short', note: 'e.g. 2014-07-15 / 9:00:00 pm' },

	place: { type: String, required: false, initial: true, width: 'medium', default: '1260 18th Street, Santa Monica, CA 90404', note: '' },
	map: { type: String, required: false, initial: true, width: 'medium', default: '1260 18th Street, Santa Monica, CA 90404', note: '' },
	description: { type: Types.Html, wysiwyg: true },

	isExternal: {type: Boolean, default: false},
	eventLink: {type: String},

	maxRSVPs: { type: Number, default: 100 },
	totalRSVPs: { type: Number, noedit: true },

	legacy: { type: Boolean, noedit: true, collapse: true },
});




// Relationships
// ------------------------------

Meetup.relationship({ ref: 'Talk', refPath: 'meetup', path: 'talks' });
Meetup.relationship({ ref: 'RSVP', refPath: 'meetup', path: 'rsvps' });




// Virtuals
// ------------------------------

Meetup.schema.virtual('url').get(function() {
	return '/meetups/' + this.key;
});

Meetup.schema.virtual('remainingRSVPs').get(function() {
	if (!this.maxRSVPs) return -1;
	return Math.max(this.maxRSVPs - (this.totalRSVPs || 0), 0);
});

Meetup.schema.virtual('rsvpsAvailable').get(function() {
	return (this.remainingRSVPs > 0);
});




// Pre Save
// ------------------------------

Meetup.schema.pre('save', function(next) {
	var meetup = this;
	var currentMoment = moment().tz('America/Los_Angeles');

	// no published date, it's a draft meetup
	if (!meetup.publishedDate) {
		meetup.state = 'draft';
	}
	// current date is 1 day or more than startDate, meetup is 'past'
	else if (currentMoment.isAfter(moment(meetup.startDate).tz('America/Los_Angeles').add('day', 1))) {
		meetup.state = 'past';
	}
	// current date is after published date, meet up is "active"
	else if (currentMoment.isAfter(moment(meetup.publishedDate).tz('America/Los_Angeles'))) {
		meetup.state = 'active';
	}
	// current date is before published date, meet up is "scheduled"
	else if (currentMoment.isBefore(moment(meetup.publishedDate).tz('America/Los_Angeles'))) {
		meetup.state = 'scheduled';
	}
	next();
});




// Methods
// ------------------------------

Meetup.schema.methods.refreshRSVPs = function(callback) {
	var meetup = this;
	keystone.list('RSVP').model.count()
		.where('meetup').in([meetup.id])
		.where('attending', true)
		.exec(function(err, count) {
			if (err) return callback(err);
			meetup.totalRSVPs = count;
			meetup.save(callback);
		});
}

Meetup.schema.methods.notifyAttendees = function(req, res, next) {
	var meetup = this;
	keystone.list('User').model.find().where('notifications.meetups', true).exec(function(err, attendees) {
		if (err) return next(err);
		if (!attendees.length) {
			next();
		} else {
			attendees.forEach(function(attendee) {
				new keystone.Email('new-meetup').send({
					attendee: attendee,
					meetup: meetup,
					subject: 'New meetup: ' + meetup.name,
					to: attendee.email,
					from: {
						name: 'D@W-LA',
						email: 'sangeles@democracyatwork.info'
					}
				}, next);
			});
		}
	});
}

Meetup.schema.set('toJSON', {
	transform: function(doc, rtn, options) {
		return _.pick(doc, '_id', 'name', 'startDate', 'endDate', 'place', 'map', 'description', 'rsvpsAvailable', 'remainingRSVPs');
	}
});


/**
 * Registration
 * ============
 */

Meetup.defaultSort = '-startDate';
Meetup.defaultColumns = 'name, state|10%, startDate|15%, publishedDate|15%';
Meetup.register();
