import { Meteor } from 'meteor/meteor';
import {listForRepo} from './githubSync';
import {setAccountsConfig} from "./accounts";
import Bounties from '../imports/collections.js'
import {getSettings} from "meteor/doichain:settings";

/*
* put this only one time into a folder reachable from client and server
* see:
* - https://github.com/meteor-useraccounts/core/blob/master/Guide.md
* - http://khaidoan.wikidot.com/meteor-authentication-customize
*/
AccountsTemplates.configure({
    showForgotPasswordLink: true,
    enablePasswordChange: true,
    hideSignUpLink: true,
    hideSignInLink: true,
    sendVerificationEmail: true,
    privacyUrl: 'https://www.doichain.org/datenschutzerklaerung/',
	reCaptcha: {
        secretKey: "6LdxAakUAAAAAOiirWmvD8D1I01aW8GdsTUBwRxb",
    }
});

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

    Meteor.publish('allUsers', function(){
        if(Roles.userIsInRole(this.userId, 'admin')){
            return Meteor.users.find({});
        }
    });
    Meteor.publish('bounties', function bountiesPublication(filter_id, orderBy, orderUpDown,stateFilter) {
            if (filter_id) {
                return Bounties.find({github_id: Number(filter_id)}, {sort: {priority: -1}});
            } else {
                if (orderUpDown === undefined || orderUpDown === null) orderUpDown = -1
                if (orderBy === undefined || orderBy === null) orderBy = 'title'
                const sort = {}
                sort[orderBy] = Number(orderUpDown)
                let filter = {}

                const statesArray = []
                JSON.parse(stateFilter).forEach(function (state) {
                    statesArray.push({state: state})
                })
                if (statesArray.length > 0) filter = {$or: statesArray}

                if (Roles.userIsInRole(Meteor.user(), ['admin'])) {
                    return Bounties.find(filter, {sort: sort});
                } else {
                    const queryAmount = {$or: [{bountyEur: {$gt: 0}}, {bountyDoi: {$gt: 0}}]};
                    const query = {$and: [filter, queryAmount]};
                    const bounties = Bounties.find(query, {sort: sort});
                    return bounties
                }
            }
        }
    )

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
                    const blockedBy = {userId:Meteor.userId(),state:"blocked"}
                    Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'blocked'}});

                    //send email to bounty hunter
                    const emailUserTo = Meteor.user().emails[0].address;
                    const emailUserFrom = getSettings('accounts.emailTemplates.from','bounties@doichain.org')

                    try {
                        Email.send({
                            to: emailUserTo,
                            from: emailUserFrom,
                            subject: "Doichain Bounties - state update: blocked bounty id:"+github_id,
                            text: "Dear "+Meteor.user().username+",\n\n" +
                                "You just blocked Doichain bounty "+github_id+
                                " visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n" +
                                "Please attach questions, comments and work results to the linked github issue of this bounty.\n\n" +
                                "Yours, Doichain.org Bounty Team",
                        });
                        console.log('block email sent to user:'+emailUserTo)
                    }catch(ex){
                        console.log('could not send block email to user:'+emailUserTo,ex)
                    }
                    
                    const adminUsers = Roles.getUsersInRole('admin')
                    adminUsers.forEach(function (user) {
                       // console.log("user",user)
                        try {
                            const to = user.emails[0].address;

                            Email.send({
                                to: to,
                                from: emailUserFrom,
                                subject: "Doichain Bounties - state update: blocked bounty id:"+github_id,
                                text: "Dear "+user.username+",\n\nUser "+Meteor.user().username+" just blocked Doichain bounty "+github_id+
                                    " visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                            });

                            console.log('block email sent to admin:'+to)
                        }catch(ex){
                            console.log('could not send block email to admin:'+user,ex)
                        }
                    })

                    return "Issue:"+github_id+" blocked by "+Meteor.userId();
                }
                //TODO send email to admin who blocked the issue
        },
        'cancelBounty'({github_id}){
            console.log('cancel bounty',github_id);
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on
            const lastUser = bounty.blockedBy[bounty.blockedBy.length-1].userId;
            //user must be authenticated, last block must belong to user (or admin), status must be "blocked"

            if(Meteor.userId() && (Meteor.userId()==lastUser || Roles.userIsInRole( Meteor.user(), ['admin']))){
                const blockedBy = {userId:Meteor.userId(),state:"cancelled",email:Meteor.user().emails[0].address}
                Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'cancelled'}});

                //send email to last user
                const emailUser = Meteor.users.findOne({"_id": lastUser})
                const emailUserFrom = getSettings('accounts.emailTemplates.from','bounties@doichain.org')

                try {
                    Email.send({
                        to: emailUser.emails[0].address,
                        from: emailUserFrom,
                        subject: "Doichain Bounties - state update: canceled bounty id:"+github_id,
                        text: "Dear "+emailUser.username+",\n\nDoichain bounty "+github_id+
                            " just got cancelled by "+Meteor.user().username+" visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                    });
                    console.log('cancel email sent to:',emailUser)
                }catch(ex){
                    console.log('could not send cancel email to admin user:'+emailUser,ex)
                }

                const adminUsers = Roles.getUsersInRole('admin')
                adminUsers.forEach(function (user) {
                    try {
                        const to = user.emails[0].address;

                        Email.send({
                            to: to,
                            from: emailUserFrom,
                            subject: "Doichain Bounties - state update: cancelled bounty id:"+github_id,
                            text: "Dear "+user.username+",\n\nUser "+Meteor.user().username+" just cancelled Doichain bounty "+github_id+
                                " visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                        });

                        console.log('cancel bounty email sent to admin:',to)
                    }catch(ex){
                        console.log('could not send cancel bounty email to admin user:'+user,ex)
                    }
                })

                return "Issue:"+github_id+" cancelled by "+Meteor.userId();
            }
        },
        'requestApproval'({github_id}){
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on
            if (bounty.state!="blocked") return;
            const lastUser = bounty.blockedBy[bounty.blockedBy.length-1].userId;
            //user must be authenticated, last block must belong to user (or admin), status must be "blocked"
            if(Meteor.userId() && (Meteor.userId()==lastUser || Roles.userIsInRole( Meteor.user(), ['admin']))){
                const blockedBy = {userId:Meteor.userId(),state:"under review"}
                Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:blockedBy},$set:{state:'under review'}});
                console.log('requested review for:',github_id);

                //send email to last user
                const emailUser = Meteor.users.findOne({"_id": lastUser})
                const emailUserFrom = getSettings('accounts.emailTemplates.from','bounties@doichain.org')

                try {
                    Email.send({
                        to: emailUser.emails[0].address,
                        from: emailUserFrom,
                        subject: "Doichain Bounties - state update: approval requested for bounty id:"+github_id,
                        text: "Dear "+emailUser.username+",\n\nDoichain bounty "+github_id+
                            " just requested approval by "+Meteor.user().username+" visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                    });
                    console.log('request approval email sent to:'+emailUser)
                }catch(ex){
                    console.log('could not send request approval email to admin user:'+emailUser,ex)
                }

                const adminUsers = Roles.getUsersInRole('admin')
                adminUsers.forEach(function (user) {
                    try {
                        const to = user.emails[0].address;

                        Email.send({
                            to: to,
                            from: emailUserFrom,
                            subject: "Doichain Bounties - state update: approval requested for bounty id:"+github_id,
                            text: "Dear "+user.username+",\n\nUser "+Meteor.user().username+" just requested approval for Doichain bounty "+github_id+
                                " visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                        });

                        console.log('request approval email sent to admin:',to)
                    }catch(ex){
                        console.log('could not send request approval email to admin user:'+user,ex)
                    }
                })

                return "Issue:"+github_id+" requested review";
            }
        },
        'approveBounty'({github_id}){
            const bounty = Bounties.findOne({github_id:github_id}); //find the bounty we are working on

            if (!Roles.userIsInRole( Meteor.user(), ['admin']) && bounty.state!="under review")
                return;

            const approvedBy = {userId:Meteor.userId(),state:"approved"}
            Bounties.update({github_id:github_id}, {$addToSet:{blockedBy:approvedBy},$set:{state:'approved'}});

            //TODO if approved set github_state to closed (on github too!)
            const emailUserFrom = getSettings('accounts.emailTemplates.from','bounties@doichain.org')
            //send email to last user
            const bountyMembers = Bounties.findOne({github_id:github_id}).blockedBy;
            const lastUserId = bountyMembers[bountyMembers.length-2].userId
            const emailUser = Meteor.users.findOne({"_id": lastUserId}).emails[0].address
            try {
                Email.send({
                    to: emailUser.emails[0].address,
                    from: emailUserFrom,
                    subject: "Doichain Bounties - state update: approval requested for bounty id:"+github_id,
                    text: "Dear "+emailUser.username+",\n\nDoichain bounty "+github_id+
                        " just requested approval by "+Meteor.user().username+" visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                });
                console.log('approval email sent to user:'+emailUser)
            }catch(ex){
                console.log('could not send approval email  to admin user:'+emailUser,ex)
            }

            const adminUsers = Roles.getUsersInRole('admin')
            adminUsers.forEach(function (user) {
                console.log("user",user)
                try {
                    const to = user.emails[0].address;

                    Email.send({
                        to: to,
                        from: emailUserFrom,
                        subject: "Doichain Bounties - state update: approval requested for bounty id:"+github_id,
                        text: "Dear "+user.username+",\n\nUser "+Meteor.user().username+" just requested approval for Doichain bounty "+github_id+
                            " visit https://www.doichain.org/en/bounties/"+github_id+" for details.\n\n Yours, Doichain.org Bounty Team",
                    });

                    console.log('approval email sent to admin:',to)
                }catch(ex){
                    console.log('could not send approval email to admin user:'+user,ex)
                }
            })

            return "Issue:"+github_id+" approved";
        },
        toggleAdmin(id){
            if(Roles.userIsInRole(this.userId, "admin")) {
                if(Roles.userIsInRole(id, "admin")) {
                    Roles.removeUsersFromRoles(id, "admin");
                } else {
                    Roles.addUsersToRoles(id, "admin")
                }
            }
        },
        deleteUser(id){
            console.log('deleting user:',id)
            if(this.username==='admin') return; //if somebody wants to delete admin user - dont do it
            if(Roles.userIsInRole(this.userId, "admin")) {  //user needs admin role to delete a user
                const foundBounty = Bounties.findOne({blockedBy: {$elemMatch: {userId:id}}})
                if(!foundBounty){ //if there are or were active bounties don't delete
                    const retVal = Meteor.users.remove({ _id: id })
                    if(retVal===1) return true  //if it was deleted return true
                    else return false
                }else return false
            }
        },
        getUsername(userId){
          //  console.log("--->",userId)
            const username =  Meteor.users.findOne(userId).username
           // console.log(username)
            return username
        }
    });
}