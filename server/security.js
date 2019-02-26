// https://atmospherejs.com/ongoworks/security
Bounties.permit(['insert', 'update', 'remove']).never();
//Bounties.permit('update').ifLoggedIn().exceptProps(['git', 'date']);