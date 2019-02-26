import { Template } from 'meteor/templating';
import Bounties from '../imports/collections.js'
import './main.html';

Template.body.onCreated(function bodyOnCreated() {
    const handle = Meteor.subscribe('bounties');
    Tracker.autorun(() => {
        const isReady = handle.ready();
        //console.log(`Handle is ${isReady ? 'ready' : 'not ready'}`);
    });
});

Template.body.events({
    'click .gitHubSync'(event) {
        console.log('calling gitHubSync');
        Meteor.call('gitHubSync', (err, res) => {
            err?alert(err):'';
        });
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

Template.body.helpers({
  bounties: function () {
    return Bounties.find({}, {sort: {priority: -1}});
  },
  fields: function () {
    // {fieldId: 'githubId',key: 'github_id',label: 'GitHubId'},
      return [
            {fieldId: 'title',key: 'title',label: 'Title', fn: function (value, object) {
                    return new Spacebars.SafeString("<a href="+object.html_url+" target='_blank'>"+value+"</a>");
                }},
            {fieldId: 'created_at',key: 'created_at',label: 'created',fn: function (value) { return  moment(value).fromNow();}},
            {fieldId: 'updated_at',key: 'updated_at',label: 'updated',fn: function (value) { return  moment(value).fromNow();}},
            {fieldId: 'state',key: 'state',label: 'State'},
            {fieldId: 'labelsId',key: 'labels',label: 'Labels',fn: function (value) { return _.pluck(value, 'name');}},
            {fieldId: 'bountyEur', key: 'bountyEU', label: 'bounty €', tmpl: Template.bountyEur},
            {fieldId: 'bountyDoi', key: 'bountyEU', label: 'bounty DOI', tmpl: Template.bountyDoi},
            {fieldId: 'priority', key: 'priority', label: 'Priority', sortOrder: 0, sortDirection: 'descending', tmpl: Template.priority},
    ];
  }
});

Template.priority.helpers({
    prioritySelected: function (key, value) {
       // console.log('key:'+key+' value:'+value);
        return key == value ? 'selected' : '';
    },
    priorityEements: function(){
        return ['0','1','2','3'];
    }
});
