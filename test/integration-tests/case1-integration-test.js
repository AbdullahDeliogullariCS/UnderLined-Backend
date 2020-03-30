const chai = require('chai');
const chaiHttp = require('chai-http');
const dummyData = require('./dummy-data');

chai.should();

chai.use(chaiHttp);

describe("Integration Test Case 1",() => {
    it("Sign Up-In --> Create Resource-Chapter --> Delete Chapter-Resource --> Delete User", () => {

        const createdUser = dummyData.userInformations.user1.createdUser;
        const userCredential = dummyData.userInformations.user1.userCredential;
        const createdResource = dummyData.userInformations.user1.createdResource;
        const createdChapter = dummyData.userInformations.user1.createdChapter;

        let token;
        let bearerToken;

        let userId;
        let resourceId;
        let chapterId;

        // Sign Up
        chai.request("localhost:5000/api/users")
            .post("/signup")
            .send(createdUser)
            .end(async (error, response) => {
                await response.should.have.status(201);

                // Sign In
                chai.request("localhost:5000/api/users")
                    .get("/signin")
                    .send(userCredential)
                    .end(async (error, response) => {
                        await response.should.have.status(202);
                        token = await response.body.token;
                        userId = await response.body.userId;

                        bearerToken = 'Bearer ' + token;
                        createdResource.creator = userId;

                        // Create Resource
                        chai.request("localhost:5000/api/resources/")
                            .post('/')
                            .set("Authorization", bearerToken)
                            .send(createdResource)
                            .end(async (error, response) => {
                                await response.should.have.status(201);
                                resourceId = await response.body.resource.id;
                                createdChapter.source = resourceId;

                                // Create Chapter
                                chai.request("localhost:5000/api/chapters")
                                    .post('/')
                                    .set("Authorization", bearerToken)
                                    .send(createdChapter)
                                    .end(async (error, response) => {
                                        await response.should.have.status(201);
                                        chapterId = await response.body.chapter.id;

                                        // Delete Chapter
                                        chai.request("localhost:5000/api/chapters")
                                            .delete(`/${chapterId}`)
                                            .set("Authorization", bearerToken)
                                            .end(async (error, response) => {
                                                await response.should.have.status(200);

                                                // Delete Resource
                                                chai.request("localhost:5000/api/resources")
                                                    .delete(`/${resourceId}`)
                                                    .set("Authorization", bearerToken)
                                                    .end(async (error, response) => {
                                                        await response.should.have.status(200);

                                                        // Delete User
                                                        chai.request("localhost:5000/api/users")
                                                            .delete(`/${userId}`)
                                                            .set("Authorization", bearerToken)
                                                            .end(async (error, response) => {
                                                                await response.should.have.status(200);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    });
});
