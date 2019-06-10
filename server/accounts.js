
import {getSettings } from 'meteor/doichain:settings';

export function setAccountsConfig() {

    Accounts.config({sendVerificationEmail:true});
   /* const accounts_sendVerificationEmail = getSettings('accounts.sendVerificationEmail',true);
    const accounts_forbidClientAccountCreation = getSettings('accounts.forbidClientAccountCreation',false);

    //this should go into accounts-password-doichain
    Accounts.config({sendVerificationEmail: accounts_sendVerificationEmail , forbidClientAccountCreation:accounts_forbidClientAccountCreation});
    */
    Accounts.emailTemplates.siteName = getSettings('accounts.emailTemplates.siteName','Doichain Bounties');
    //TODO giving a real name to the email address is not supported by Doichain right now
    //Accounts.emailTemplates.from = getSettings('accounts.emailTemplates.from','Doichain Bounties Admin <bounties@le-space.de>');

    Accounts.emailTemplates.from = getSettings('accounts.emailTemplates.from','bounties@doichain.org');


    /**
     *
     * This emails or not send when account-password-doichain is active
     *

    Accounts.emailTemplates.enrollAccount.subject = (user) => {
        return `Welcome to Doichain Bounties, ${user.profile.name}`;
    };
    Accounts.emailTemplates.enrollAccount.text = (user, url) => {
        return 'You have been selected to participate in building a better future!'
            + ' To activate your account, simply click the link below:\n\n'
            + url;
    };**/
    /*
     * @param user
     * @returns {string}
     */
    Accounts.emailTemplates.resetPassword.from = () => {
        // Overrides the value set in `Accounts.emailTemplates.from` when resetting
        // passwords.
        return 'Doichain Bounties Password Reset <doichain@le-space.de>'; //TODO make this configurable
    };
    Accounts.emailTemplates.verifyEmail = {
        subject() {
            return "Activate your account now!";
        },
        text(user, url) {
            return `Hey ${user}! Verify your e-mail by following this link: ${url}`;
        }
    };

    Accounts.onCreateUser(function(options, user) {
        if (options.profile) {
            user.profile = options.profile;
        }
        user.roles = ['hunter'];
        return user;
    });
}