import { Meteor } from 'meteor/meteor';
import {listForRepo} from './githubSync';
import {setAccountsConfig} from "./accounts";
import Bounties from '../imports/collections.js'

Meteor.startup(() => {

    if(!Accounts.findUserByUsername('admin')){
        const adminUser = Accounts.createUser({username: 'admin',
                email : 'doichain-bounties@doichain.org',
                password : 'password'});

        Roles.addUsersToRoles(adminUser,['admin','hunters']);
    }
    setAccountsConfig();
    listForRepo();
});

if (Meteor.isServer) {
    Meteor.publish('bounties', function bountiesPublication() {
        return Bounties.find({}, {sort: {priority: -1}});
    });


    Meteor.methods({
        'gitHubSync'() {
            if (Roles.userIsInRole( Meteor.user(), ['admin']))
                listForRepo();
        },
        'changeBountyEur'({ github_id, value }) {
            if (Roles.userIsInRole( Meteor.user(), ['admin']))
                Bounties.update({github_id:github_id},{$set:{bountyEur:value}});
        },
        'changeBountyDoi'({ github_id, value }) {
            if (Roles.userIsInRole( Meteor.user(), ['admin']))
                Bounties.update({github_id:github_id},{$set:{bountyDoi:value}});
        },
        'changePriority'({ github_id, value }) {
            if (Roles.userIsInRole( Meteor.user(), ['admin']))
                Bounties.update({github_id:github_id},{$set:{priority:value}});
        }
    });
}