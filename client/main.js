import { Template } from 'meteor/templating';
import { Session } from 'meteor/session'
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import Bounties from '../imports/collections.js'
import SettingsTable from "meteor/doichain:settings";
import './settings.html';
import './main.html';

ShareIt.configure({
    sites: {                // nested object for extra configurations
        'facebook': null,
        'twitter': {},
        'googleplus': null,
        'pinterest': null
    },
    classes: "dc-tooltip-left", // string (default: 'large btn')
                          // The classes that will be placed on the sharing buttons, bootstrap by default.
    iconOnly: true,      // boolean (default: false)
                          // Don't put text on the sharing buttons
    applyColors: false,     // boolean (default: true)
    // apply classes to inherit each social networks background color
    faSize: '',            // font awesome size
    faClass: 'fab fa-twitter'		  // font awesome classes like square
});

const locale = navigator.language || navigator.userLanguage;
moment.locale(locale.substring(0,2));
let id_filter;

FlowRouter.route('/settings', {
    name: 'Settings.list',
    action(params, queryParams) {
        BlazeLayout.render("settings");
    }
});

FlowRouter.route('/:_id', {
    name: 'Bounties.show',
    action(params, queryParams) {
        id_filter = params._id;
        const handle = Meteor.subscribe('bounties', id_filter);
        Tracker.autorun(() => {
            const isReady = handle.ready();
        });
    }
});


FlowRouter.route('/', {
    name: 'Bounties.list',
    action(params, queryParams) {

       const stateFilters = ['open','cancelled']
        const orderBy = 'title'
        const orderUpDown = -1
        Session.setDefault('orderBy',orderBy)
        Session.setDefault('orderUpDown',orderUpDown)
        Session.setDefault('stateFilter',JSON.stringify(stateFilters))

        Tracker.autorun(function() {
            const handle = Meteor.subscribe('bounties',null,
                Session.get('orderBy'),
                Session.get('orderUpDown'),
                Session.get('stateFilter'));
            const isReady = handle.ready();
        });
    }
});

Template.body.events({
    'click .gitHubSync'(event) {
        Meteor.call('gitHubSync', (err, res) => {
            err?alert(err):'';
        });
    },
    'change .orderBy'(event) {
        Session.set('orderBy',event.target.value);
    },
    'change .orderUpDown'(event) {
        Session.set('orderUpDown',event.target.value);
    },
    'click .stateFilter'(event) {
        let stateFilters = []
        if(Session.get('stateFilter')!==null) stateFilters = JSON.parse(Session.get('stateFilter'))
        if(event.target.checked)
            stateFilters.push(event.target.value);
        else{
            const filtered = stateFilters.filter(function (el) {
                return el != event.target.value;
            });
            stateFilters = filtered

        }
        Session.set('stateFilter',JSON.stringify(stateFilters))
}
});
Template.bountyEur.events({
    'blur .bountyEur'(event) {
        Meteor.call('changeBountyEur', {github_id: this.github_id,value: event.target.value}, (err, res) => {
            err?alert(err):'';
        });
    }
});

Template.bountyDoi.events({
    'blur .bountyDoi'(event) {
        Meteor.call('changeBountyDoi', {github_id: this.github_id,value: event.target.value}, (err, res) => {
            err?alert(err):'';
        });
    }
});

Template.priority.events({
    'change .priority'(event){
        Meteor.call('changePriority', {github_id: this.github_id,value: event.target.value}, (err, res) => {
            err?alert(err):'';
        });
    }
});

Template.blockBounty.events({
    'click .blockBounty'(event){
        Meteor.call('blockBounty', {github_id: this.github_id}, (err, res) => {
            console.log(res);
            err?alert(err):'';
        });
    },
    'click .cancelBounty'(event){
        Meteor.call('cancelBounty', {github_id: this.github_id}, (err, res) => {
            console.log(res);
            err?alert(err):'';
        });
    },
    'click .requestApproval'(event){
        Meteor.call('requestApproval', {github_id: this.github_id}, (err, res) => {
            console.log(res);
            err?alert(err):'';
        });
    },
    'click .approveBounty'(event){
        Meteor.call('approveBounty', {github_id: this.github_id}, (err, res) => {
            console.log(res);
            err?alert(err):'';
        });
    }
});

Template.body.helpers({
      bounties: function () {
          let filter = {};
          const sort = {}
          const orderBy = Session.get('orderBy')
          const orderUpDown = Session.get('orderUpDown')
          sort[orderBy] = Number(orderUpDown)
          if(id_filter) filter = {github_id: filter};
        return  Bounties.find(filter,{sort:sort}).fetch();//Bounties.find(filter,{sort:sort});
      },
    fields: function () {
      return [
            {fieldId: 'title',key: 'title',label: 'Title', tmpl: Template.bountyMain},
		    {fieldId: 'priority', key: 'priority', label: 'Priority',  sortOrder: 0, sortDirection: 'descending', hidden: true, tmpl: Template.priority},
		  	{fieldId: 'created_at',key: 'created_at',label: 'created', sortOrder: 1, sortDirection: 'ascending', hidden: true, fn: function (value) { return  moment(value).fromNow();}},
		    {fieldId: 'updated_at',key: 'updated_at',label: 'updated',hidden: true,fn: function (value) { return  moment(value).fromNow();}},
            {fieldId: 'state',key: 'state',label: 'State',hidden: true,},
            {fieldId: 'labelsId',key: 'labels',label: 'Labels',hidden: true, tmpl: Template.labels},
            {fieldId: 'bountyEur', key: 'bountyEU', label: 'bounty €',hidden: true, tmpl: Template.bountyEur},
            {fieldId: 'bountyDoi', key: 'bountyEU', label: 'bounty DOI',hidden: true, tmpl: Template.bountyDoi},
            {fieldId: 'blockBounty', key: 'blockedBy', label: 'blocked by',hidden: true, tmpl: Template.blockBounty},
    ];
    },
    orderBy: function(state){
        //console.log('orderBy',state)
        return Session.get('orderBy')===state?'selected':''
    },
    orderUpDown: function(direction){
        //console.log('orderUpDown',direction)
        return Session.get('orderUpDown')===direction?'selected':''
    }
});

Template.bountyMain.onRendered(function() {
    var clipboard = new Clipboard('.btn-copy-link');
});

Template.bountyMain.events({
});
Template.bountyMain.helpers({
    shareData: function () {
        return { title: 'Doichain bounty: '+this.title, url: 'https://www.doichain.org/bounties/'+this.github_id}
    },
    isPriorityIcon: function (priority){
		if(this.priority===2)return 'fas fa-star-half-alt';
		else if(this.priority===3)return 'fas fa-star';
        else return 'far fa-star';
    },
    stateColor: function (state){
		if(this.state==='under review')return 'review';
        else return this.state;
    },
	created: function (created_at){
		return  moment(this.created_at).fromNow();
	},
	updated: function (updated_at){
		return  moment(this.updated_at).fromNow();
	},
	getUser: function(userId){
         Meteor.call('getUsername', {_id: userId}, (err, res) => {
             err?alert(err):'';
                Session.set("getUser_"+userId,res)
         });
        return Session.get("getUser_"+userId) || "Loading";
    },
	blockedBy: function (){
        //find the last blockedBy of this issue
        const blocks = Bounties.findOne({github_id:this.github_id}).blockedBy;
        if(!blocks || blocks.length==0) return null; //if no block return

        const blockedUntil =  blocks[blocks.length-1].blockedUntil; //get blockedUntil for this issue
        const state = blocks[blocks.length-1].state;

        const retObj = {
            state:state,
            blockedUntil:moment(blockedUntil).format('LLLL'),
            by: blocks[blocks.length-1].userId
        };
        return  retObj;//return email address and date until its blocked
    },
    isState: function (state){
        if(this.state===state)return true;
        else return false;
    },
    isMine: function () {
        const blocks = Bounties.findOne({github_id:this.github_id}).blockedBy;
        if(!blocks || blocks.length==0) return null; //if no block return

        const userId = blocks[blocks.length-1].userId; //get last userId of this issue
        if(userId==Meteor.userId())return true;
        else return false;
    }
});

Template.priority.helpers({
    prioritySelected: function (key, value) {
        return key == value ? 'selected' : '';
    },
    priorityEements: function(){
        return ['0','1','2','3'];
    }
});

Template.blockBounty.helpers({
    blockedBy: function (){
        //find the last blockedBy of this issue
        const blocks = Bounties.findOne({github_id:this.github_id}).blockedBy;
        if(!blocks || blocks.length==0) return null; //if no block return

        const blockedUntil =  blocks[blocks.length-1].blockedUntil; //get blockedUntil for this issue
        const emailaddress = blocks[blocks.length-1].email;
        const state = blocks[blocks.length-1].state;
        const retObj = {by:emailaddress, state:state, blockedUntil:moment(blockedUntil).format('LLLL')};
        return  retObj;//return email address and date until its blocked
    },
    isState: function (state){
        if(this.state===state)return true;
        else return false;
    },
    isMine: function () {
        const blocks = Bounties.findOne({github_id:this.github_id}).blockedBy;
        if(!blocks || blocks.length==0) return null; //if no block return

        const userId = blocks[blocks.length-1].userId; //get last userId of this issue
        if(userId==Meteor.userId())return true;
        else return false;
    }

});

Template.settings.helpers({
    SettingsTable() {
        return SettingsTable;
    }
})
// User-Accounts

Template['override-atTitle'].replaces('atTitle');
Template['override-atTermsLink'].replaces('atTermsLink');
Template['override-atPwdForm'].replaces('atPwdForm');
Template['override-atTextInput'].replaces('atTextInput');
Template['override-atSelectInput'].replaces('atSelectInput');
Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');

AccountsTemplates.configure({
	showForgotPasswordLink: true,
	enablePasswordChange: true,
	hideSignUpLink: true,
	hideSignInLink: true,
    sendVerificationEmail: true,
    privacyUrl: 'https://www.doichain.org/datenschutzerklaerung/',
	reCaptcha: {
        siteKey: "6LdxAakUAAAAAJfziv2MT0nQngu5VxM6Lf3Fb9ma",
        theme: "light",
        data_type: "image",
    },
    showReCaptcha: true
});


var email = AccountsTemplates.removeField('email');
var password = AccountsTemplates.removeField('password');

AccountsTemplates.addFields([
	email,
	{
		_id: 'username',
		type: 'text',
		displayName: 'Username',
		required: true,
		minLength: 3,
    	errStr: 'At least 3 characters',
	},{
		_id: 'profession',
		type: 'select',
		displayName: 'Profession (optional)',
		placeholder: 'Choose',
		select: [
			{
				text: '- Please choose -',
				value: 'choose'
			},{
				text: 'Developer',
				value: 'developer'
			},{
				text: 'Designer',
				value: 'designer'
			},{
				text: 'Writer',
				value: 'writer'
			},{
				text: 'Other',
				value: 'other'
			}
		]
	}, password
]);

// Get user data
Meteor.subscribe('allUsers');


Template.AccountNav.helpers({
	users: function() {
		return Meteor.users.find();
	},
	userEmail: function(){
		return this.emails[0].address;
	},
	created: function () {
		return moment(this.createdAt).format('LLLL');
	},
	isAdmin: function() {
		return Roles.userIsInRole(this._id, "admin") ? "admin" : "";
	},
    isNotAdminUserUser: function (id) {
        if(Meteor.userId() !== id) return true
        else false
    }
});

Template.AccountNav.events({
	'click #logout-btn': ()=> {
		Meteor.logout();
	},
	"click .toggle-admin": function() {
		Meteor.call("toggleAdmin", this._id,(err, res) => {
            console.log(res);
            err?alert(err):'';
        });
	},
    "click .delete-user": function() {
        Meteor.call("deleteUser", this._id, (err, res) => {
            if(res) alert('deleted')
            else alert('could not delete user - maybe has or had active bounties?')
            err?alert(err):'';
        });
    },
});
