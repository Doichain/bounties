
export function setAccountsConfig() {
    Accounts.config({sendVerificationEmail: true , forbidClientAccountCreation:false});
    Accounts.emailTemplates.siteName = 'Doichain Bounties';
    Accounts.emailTemplates.from = 'Doichain Bounties Admin <bounties@le-space.de>'; //TODO make this configurable
    Accounts.emailTemplates.enrollAccount.subject = (user) => {
        return `Welcome to Doichain Bounties, ${user.profile.name}`;
    };

    Accounts.emailTemplates.enrollAccount.text = (user, url) => {
        return 'You have been selected to participate in building a better future!'
            + ' To activate your account, simply click the link below:\n\n'
            + url;
    };

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

/*    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
    });*/

}