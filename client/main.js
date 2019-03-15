import { Template } from 'meteor/templating';
import Bounties from '../imports/collections.js'
import './main.html';

const locale = navigator.language || navigator.userLanguage;  //window.navigator.language;
moment.locale(locale.substring(0,2));

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
            {fieldId: 'blockBounty', key: 'blockedBy', label: 'blocked by', tmpl: Template.blockBounty},
    ];
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
