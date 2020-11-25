const { ApolloServer , gql, PubSub} = require('apollo-server')

const users = [];

const typeDefs = gql`
    type User{
        _id: ID
        name: String!
        email: String!
        active: Boolean!
    }

    type Post{
        _id: ID!
        title: String!
        content: String!
        author: User!
    }

    type Query{
        hello: String
        users: [User!]!
        getUserByEmail(email: String!): User!
    }

    type Mutation {
        createUser(name: String!, email: String!): User
    }

    type Subscription{
        userAdded: User!
    }

`;

const resolvers = {
    Query: {
        hello: () => 'Heloo world',
        users: () => users,
        getUserByEmail: (_, args) =>{
            return users.find((user) => user.email === args.email)
        }
    },
    Mutation:{
        createUser: (_, args, { pubsub }) => {
            const newUser = {
                _id: String(Math.random()),
                name: args.name,
                email: args.email,
                active: true
            };
            users.push(newUser);

            pubsub.publish("USER_ADDED", {
                userAdded: newUser,
            })

            return newUser;
        }
    },
    Subscription:{
        userAdded: {
            subscribe: (obj, args, { pubsub }) => pubsub.asyncIterator('USER_ADDED')
        }
    }
};

const pubsub = new PubSub();
const server = new ApolloServer({ typeDefs, resolvers, context: {pubsub} });
server.listen().then(({url}) => console.log(`Server started at ${url}`));
