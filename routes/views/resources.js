var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	// Init locals
	locals.section = 'resource';
	locals.page.title = 'Resources - D@W-LA';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		resources: [],
		categories: []
	};
	
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('ResourceCategory').model.find().sort('name').exec(function(err, results) {
			
			if (err || !results.length) {
				return next(err);
			}
			
			locals.data.categories = results;
			
			// Load the counts for each category
			async.each(locals.data.categories, function(category, next) {
				
				keystone.list('Resource').model.count().where('category').in([category.id]).exec(function(err, count) {
					category.ResourceCount = count;
					next(err);
				});
				
			}, function(err) {
				next(err);
			});
			
		});
		
	});
	
	// Load the current category filter
	view.on('init', function(next) {
		
		if (req.params.category) {
			keystone.list('ResourceCategory').model.findOne({ key: locals.filters.category }).exec(function(err, result) {
				locals.data.category = result;
				next(err);
			});
		} else {
			next();
		}
		
	});
	
	// Load the Resources
	view.on('init', function(next) {
		
		var q = keystone.list('Resource').model.find().where('state', 'published').sort('-publishedDate').populate('author categories');
		
		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}
		
		q.exec(function(err, results) {
			locals.data.resources = results;
			next(err);
		});
		
	});
	
	// Render the view
	view.render('site/resources');
	
}
