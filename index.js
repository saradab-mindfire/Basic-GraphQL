const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const { 
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql');
const app = express();

const messageInit = async( param ) => {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            resolve( "Message Delivered" )
        }, 3000 );
    } )
}

/*
    * Test Schema 1 
*/
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "HelloWorld",
        fields: () => ({
            message: { 
                type: GraphQLString,
                resolve: messageInit
            },
            message1: { 
                type: GraphQLString,
                resolve: messageInit
            },
            message2: { 
                type: GraphQLString,
                resolve: messageInit
            },
            message3: { 
                type: GraphQLString,
                resolve: messageInit
            }
        })
    })
})

app.use( '/graphql-demo1', expressGraphQL({
    schema: schema,
    graphiql: true
}) )

/*
    * Test Schema 1 End
*/

/*
    * Test Schema 2
*/

const authors = [
    { id: 1, name: "J. K. Rowling" },
    { id: 2, name: "J. R. R. Tolkien" },
    { id: 3, name: "Brent Weeks" }
];

const books = [
    { id: 1, name: "Book1", authorId: 1 },
    { id: 2, name: "Book2", authorId: 1 },
    { id: 3, name: "Book3", authorId: 1 },
    { id: 4, name: "Book4", authorId: 2 },
    { id: 5, name: "Book5", authorId: 2 },
    { id: 6, name: "Book6", authorId: 2 },
    { id: 7, name: "Book7", authorId: 3 },
    { id: 8, name: "Book8", authorId: 3 },
    { id: 9, name: "Book9", authorId: 3 },
];

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: () => ({
        id: { type: GraphQLNonNull( GraphQLInt ) },
        name: { type: GraphQLNonNull( GraphQLString ) },
        authorId: { type: GraphQLNonNull( GraphQLInt ) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find( author => author.id === book.authorId )
            }
        }
    }) 
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents a author of a book",
    fields: () => ({
        id: { type: GraphQLNonNull( GraphQLInt ) },
        name: { type: GraphQLNonNull( GraphQLString ) },
        books: {
            type: new GraphQLList(BookType),
            resolve: ( author ) => {
                return books.filter( book => book.authorId === author.id )
            }
        }
    }) 
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: "A Single Book",
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString }
            },
            resolve: ( parent, args ) => books.find( book => (book.id === args.id || book.name === args.name) )
        },
        books: {
            type: new GraphQLList( BookType ),
            description: "List of all books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList( AuthorType ),
            description: "List of all authors",
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: "A Single Author",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: ( parent, args ) => authors.find( author => author.id === args.id )
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add Book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: ( parent, args ) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId };
                books.push( book );
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add Author",
            args: {
                name: { type: GraphQLNonNull( GraphQLString ) }
            },
            resolve: ( parent, args ) => {
                const author = { id: authors.length + 1, name: args.name };
                authors.push( author );
                return author;
            }
        },
        updateBook: {
            type: BookType,
            description: "Update Book",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: ( parent, args ) => {
                const index = books.findIndex( book => book.id === args.id );
                if( args['name'] ) {
                    books[index].name = args.name;
                }
                if( args['authorId'] ) {
                    books[index].authorId = args.authorId;
                }
                return books[index];
            }
        },
        updateAuthor: {
            type: AuthorType,
            description: "Update Author",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: ( parent, args ) => {
                const index = authors.findIndex( author => author.id === args.id );
                if( args['name'] ) {
                    authors[index].name = args.name;
                }
                return authors[index];
            }
        }
    })
})

const schema2 = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
}) 

app.use( '/graphql-demo2', expressGraphQL({
    schema: schema2,
    graphiql: true
}) )

/*
    * Test Schema 2 End
*/

app.listen( 5000, () => {
    console.log("Server Running On Port 5000");
} )