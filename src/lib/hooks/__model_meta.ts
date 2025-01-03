/******************************************************************************
* This file was generated by ZenStack CLI.
******************************************************************************/

/* eslint-disable */
// @ts-nocheck

const metadata = {
    models: {
        user: {
            name: 'User', fields: {
                id: {
                    name: "id",
                    type: "String",
                    isId: true,
                    attributes: [{ "name": "@default", "args": [] }],
                }, email: {
                    name: "email",
                    type: "String",
                }, password: {
                    name: "password",
                    type: "String",
                    isOptional: true,
                }, entries: {
                    name: "entries",
                    type: "Entry",
                    isDataModel: true,
                    isArray: true,
                    backLink: 'author',
                },
            }
            , uniqueConstraints: {
                id: {
                    name: "id",
                    fields: ["id"]
                }, email: {
                    name: "email",
                    fields: ["email"]
                },
            }
            ,
        }
        ,
        entry: {
            name: 'Entry', fields: {
                id: {
                    name: "id",
                    type: "String",
                    isId: true,
                    attributes: [{ "name": "@default", "args": [] }],
                }, createdAt: {
                    name: "createdAt",
                    type: "DateTime",
                    attributes: [{ "name": "@default", "args": [] }],
                }, updatedAt: {
                    name: "updatedAt",
                    type: "DateTime",
                    attributes: [{ "name": "@updatedAt", "args": [] }],
                }, title: {
                    name: "title",
                    type: "String",
                }, originalFile: {
                    name: "originalFile",
                    type: "String",
                    isOptional: true,
                }, readingPath: {
                    name: "readingPath",
                    type: "String",
                    isOptional: true,
                }, entryType: {
                    name: "entryType",
                    type: "String",
                }, author: {
                    name: "author",
                    type: "User",
                    isDataModel: true,
                    backLink: 'entries',
                    isRelationOwner: true,
                    foreignKeyMapping: { "id": "authorId" },
                }, authorId: {
                    name: "authorId",
                    type: "String",
                    isForeignKey: true,
                    relationField: 'author',
                },
            }
            , uniqueConstraints: {
                id: {
                    name: "id",
                    fields: ["id"]
                },
            }
            ,
        }
        ,
    }
    ,
    deleteCascade: {
    }
    ,
    authModel: 'User'
};
export default metadata;
