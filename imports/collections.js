import SimpleSchema from 'simpl-schema';

const Bounties = new Mongo.Collection('bounties');

const labelsSchema = new SimpleSchema({
    name: String,
    color: String
});

const blockedBySchema = new SimpleSchema({
    userId: String,
    blockTime: {
        type: Number,
        label: "Blocktime",
        defaultValue: 7
    },
    blockedUntil: {
        type: Date,
        label: "blocked until",
        autoValue: function() {

                        var blockTime = this.field('blockTime');
                        var date = new Date();
                        if(blockTime.isSet){
                            date.setDate(date.getDate() + blockTime.value);
                        }
                        date.setDate(date.getDate() + 7);
                        console.log(date);
                        return date;
        },
        optional: true
    },
    state: {type:String, optional:true},
    comment: {type:String, optional:true},
    amountPayable: {type:Number, optional:true},
    currencyPayable: {type:String, optional:true}
});

Bounties.attachSchema(new SimpleSchema({
    github_id: {
        type: Number,
        label: "Github Id"
    },
    created_at:{
        type: Date,
        label: "created at"
    },
    updated_at:{
        type: Date,
        label: "updated at"
    },
    labels: {
        type: Array,
        label: "Labels"
    },
    'labels.$': labelsSchema,
    title: {
        type: String,
        label: "Title"
    },
    body: {
        type: String,
        label: "Body",
        optional: true
    },
    github_state: {
        type: String,
        label: "GitHub State",
    },
    state: {
        type: String,
        label: "State",
        defaultValue: "open"
    },
    bountyEur: {
        type: Number,
        label: "Bounty €",
        optional: true
    },
    bountyDoi: {
        type: Number,
        label: "Bounty Eur",
        optional: true
    },
    priority: {
        type: Number,
        label: "Priority",
        optional: true
    },
    html_url: {
        type: String,
        label: "URL",
        optional: true
    },
    blockedBy: {
        type: Array,
        optional: true
    },
    'blockedBy.$': blockedBySchema,
}, { tracker: Tracker }));


module.exports = Bounties;