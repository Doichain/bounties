import SimpleSchema from 'simpl-schema';

const Bounties = new Mongo.Collection('bounties');
const labelsSchema = new SimpleSchema({
    name: String,
    color: String
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
    state: {
        type: String,
        label: "Label"
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
        label: "URL"
    }
}, { tracker: Tracker }));


module.exports = Bounties;