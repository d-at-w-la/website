var keystone = require('keystone');

var Resource = keystone.list('Resource');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Init locals
	locals.section = 'resource';
	locals.filters = {
		resource: req.params.resource
	};

	view.on('init', function(next) {

		Resource.model.findOne()
			.where('slug', locals.filters.resource)
			.populate('author categories relatedPost')
			.exec(function(err, resource) {

				if (err) return res.err(err);
				if (!resource) return res.notfound('Resource not found');

				// Allow admins or the author to see draft resources
				if (resource.state == 'published' || (req.user && req.user.isAdmin) || (req.user && resource.author && (req.user.id == resource.author.id))) {
					locals.resource = resource;
					locals.resource.populateRelated('comments[author]', next);
					locals.page.title = resource.title + ' - Resource - D@W-LA';
				} else {
					return res.notfound('Resource not found');
				}

			});

	});

	// Load recent resources
	view.query('data.resources',
		Resource.model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author')
			.limit('4')
	);

	view.on('resource', { action: 'create-comment' }, function(next) {

		// handle form
		var newResourceComment = new ResourceComment.model({
				resource: locals.resource.id,
				author: locals.user.id
			}),
			updater = newResourceComment.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your comment:'
			});

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'content'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				req.flash('success', 'Your comment has been added successfully.');
				return res.redirect('/resources/' + locals.resource.slug);
			}
			next();
		});

	});

	// Render the view
	view.render('site/resource');

}
