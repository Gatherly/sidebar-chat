##### _Engineering Challenge_
# Sidebar  📺 💬

Our main app is an immersive virtual space where users can sporadically form huddles, hear broadcasts, and get the "public gathering" feel of an in-person event from the comfort of their personal computer. 

But just for fun, what if we wanted to have a sister app that delivers a simpler, more intimate video chat experience? Sidebar Chat is the result. 

To be honest, it could use a little work... Maybe you can help?

**A successful video chat app will:**
- [ ] Allow anyone to create a virtual video chat room
- [ ] Allow up to 3 other people to join their video conversation via a link
- [ ] Allow users to and mute/unmute themselves
- [ ] Allow users to turn their camera on & off
- [ ] Display users' names and pronouns whether their video is on or off
- [ ] Allow the host to end the conversation
- [ ] Comply with basic accessibility standards

## Directions
1. **Clone this application** into a PRIVATE repo. 
2. **Run it locally** _using the instructions below. (If you are having trouble, feel free to reach out to alicia@gatherly.io or your point of contact.)_
3. **Whip it into shape**. _Using the basic functionality checklist above, as well as your general knowledge of coding best practices and app development, identify and fix as many problems as you can._ 
4. **Invite your interviewers, as listed in the prompt email.**

## Additional Directions for Senior Engineers
_Kick it up a notch by adding **one** (1) additional feature that you think will take this app to the next level. What you choose to add is up to you, but you should pick something that can be accomplished within the allotted time (3-5 hours for the entire challenge), will significantly improve user (or possibly developer) experience, and will show off your unique skillset._

Some ideas for inspiration...
- Make the app work well on mobile devices
- Allow attendees to share their screen
- Allow the host to choose a chatroom color scheme when creating their chatroom
- Creating a super-plush build process that deploys the app somewhere on the internet, 


### Local Development

#### Environment Variables
**.env**
```
ENVIRONMENT=development
POSTGRES_USER=dev
POSTGRES_DB=sidebar
DATABASE_URL=localhost
AWS_ACCESS_KEY=<your_aws_key>
AWS_SECRET_KEY=<your_aws_secret_key>
PORT=3030
```
**/side-bar-web/.env.development**
```
REACT_APP_HOST=http://localhost:3030
```

#### Database
This project uses a PostgreSQL database locally, and the Heroku Postgres addon in Production.
Generate a clean database locally with `yarn resetdb`.

#### Server
```
yarn && yarn start
```
Server will be running on localhost:3030.

#### Client
```
cd side-bar-web
source .env.development
yarn
yarn start 
```

Navigate to http://localhost:3000/ to view the app.

Note: The current distribution of the node-sass package can fail to compile properly in some environments. The "install-with-rebuild" script runs an extra `npm rebuild node-sass` to avoid build issues.


