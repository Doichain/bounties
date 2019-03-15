# Bounty manager

## Connects to a Github profile reads out issues with a certain label and provides for the admin a possibility to add a bounty. Other users can claim the bounty by providing a delivery date.

### TODOs
- add doichain ci design to template / css
- improve style of table

### Todos bounty hunter
- send emails to admin / bounty hunter
- approve bounty on github (change state to closed)

### Todos bounty admin
- remove bounty / or disable it from local database if bounty-tag is removed from github

### Environment variables
The server reads from the MAIL_URL environment variable to determine how to send mail. The MAIL_URL should reference an SMTP server and use the form smtp://USERNAME:PASSWORD@HOST:PORT or smtps://USERNAME:PASSWORD@HOST:PORT

### DEPLOYMENT
- via docker: https://hub.docker.com/r/abernix/meteord#tag-variations
-  abernix/meteord:node-8-base
    - docker build -t doichain/bounties .
    - https://hub.docker.com/r/abernix/meteord
    - docker run -d \
          -e ROOT_URL=https://bounties.doichain.org \
          -e MONGO_URL=mongodb://x:y@IP:27017/bounties \
          -e MAIL_URL=smtps://emailuser:emailpw@emailserver:465 \
          -p 3003:80 \
          --name doichain_bounties \
          doichain/bounties
          
    - meteor build --architecture=os.linux.x86_64 ./     
    - docker run -d \
          -e ROOT_URL=https://bounties.doichain.org \
          -e MONGO_URL=mongodb://x:y@IP:27017/bounties \
          -e MAIL_URL=smtps://emailuser:emailpw@emailserver:465 \
          -p 3003:80 \
           --name doichain_bounties \
          -v /usr/src/bounties/bundle:/bundle \
          --name doichain_bounties \
          abernix/meteord:node-8-base
          
          -e MONGO_OPLOG_URL=mongodb://oplog_url \ 

### Links and useful information
- Blaze/SpacebarsJS
    - http://blazejs.org/api/spacebars.html#If-Unless
    - https://www.discovermeteor.com/blog/spacebars-secrets-exploring-meteor-new-templating-engine/
- Settings https://blog.meteor.com/the-meteor-chef-making-use-of-settings-json-3ed5be2d0bad
- ReactiveTable for blaze https://github.com/aslagle/reactive-table https://atmospherejs.com/aslagle/reactive-table
- Security package https://atmospherejs.com/ongoworks/security
- Simple Schema https://github.com/aldeed/simple-schema-js
- Meteor autoform https://github.com/aldeed/meteor-autoform#a-basic-update-form
- Define a schema in Metor https://guide.meteor.com/collections.html
- Data loading in Meteor https://guide.meteor.com/data-loading.html

### Deployment

## Done
- 14-03-2019 - login / create account / roles (hunter, admin)
- 14-03-2019 - block bounty, cancel bounty
- 14-03-2019 - unblock bounty as admin / bounty hunter
- 14-03-2019 add blockTime as field 

- 26-02-2019 build and deploy as bundle on explorer.doichain.org / package as docker image
- 25-02-2019 link to details of a bounty in Github (new window)
- 25-02-2019 run github sync every 30mins / or when admin triggers it (whats best?)
- 25-02-2019 admin can set priority, price in EUR, price in DOI or price in EUR_AND_DOI

- 24-02-2019 on startup, if no admin is in database add admin user with role admin

- 23-02-2019 add accounts package  https://docs.meteor.com/api/accounts.html
- 23-02-2019 add roles package https://atmospherejs.com/alanning/roles

- 22-02-2019 set email url of email module https://docs.meteor.com/api/email.html
- 22-02-2019 configure accounts-ui https://docs.meteor.com/packages/accounts-ui.html
- 22-02-2019 configure account-password settings