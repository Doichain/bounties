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
        },
        'blockBounty'({github_id}){
                if(Meteor.userId()){
                    const blockedBy = {userId:Meteor.userId(),states:"blocked",email:Meteor.user().emails[0].address}
                    Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'blocked'}});
                    return "Issue:"+github_id+" blocked by "+Meteor.userId();
                }
                //TODO send email to admin who blocked the issue
        },
        'cancelBounty'({github_id}){
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on
            if (bounty.state!="blocked") return;
            const lastUser = bounty.blockedBy[bounty.blockedBy.length-1].userId;
            //user must be authenticated, last block must belong to user (or admin), status must be "blocked"
            if(Meteor.userId() && (Meteor.userId()==lastUser || Roles.userIsInRole( Meteor.user(), ['admin']))){
                const blockedBy = {userId:Meteor.userId(),states:"cancelled",email:Meteor.user().emails[0].address}
                Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'cancelled'}});
                //TODO send Email to Administrator if hunter cancelled if admin cancelled send it to hunter
                return "Issue:"+github_id+" cancelled by "+Meteor.userId();
            }
        },
        'requestApproval'({github_id}){
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on
            if (bounty.state!="blocked") return;
            const lastUser = bounty.blockedBy[bounty.blockedBy.length-1].userId;
            //user must be authenticated, last block must belong to user (or admin), status must be "blocked"
            if(Meteor.userId() && (Meteor.userId()==lastUser || Roles.userIsInRole( Meteor.user(), ['admin']))){
                const blockedBy = {userId:Meteor.userId(),states:"under review",email:Meteor.user().emails[0].address}
                Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'under review'}});
                console.log('requested review for:',github_id);

                //TODO send Email to Administrator
                return "Issue:"+github_id+" requested review";
            }
        },
        'approveBounty'({github_id}){
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on

            if (!Roles.userIsInRole( Meteor.user(), ['admin']) && bounty.state!="under review")
                return;

            const blockedBy = {userId:Meteor.userId(),states:"approved",email:Meteor.user().emails[0].address}
            Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'approved'}});

            //TODO if approved set github_state to closed (on github too!)
            //TODO send email to hunter about approval and send money (automatically?!)
            return "Issue:"+github_id+" approved";
        }
    });
}