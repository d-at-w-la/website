var keystone = require('keystone');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	locals.section = 'about';
	locals.page.title = 'About Democracy@Work - Los Angeles';

	locals.organisers = [
		{ name: 'Kayla Al-Shamma-Jones', image: '/images/organisers/kayla_jones.jpg', twitter: 'twalve', title: 'Research/Social Media', profile: '/member/sharkie' },
		{ name: 'Liz Phillips', image: '/images/organisers/liz_phillips.jpg', twitter: 'jedwatson', title: 'Content Production', profile: '/member/jed-watson' },
		{ name: 'Andrea Iannone', image: '/images/organisers/andrea_iannone.jpg', twitter: 'geekyjohn', title: 'Fundrasing/Outreach', profile: '/member/john-van-der-loo' }
	]

	view.render('site/about');

}
