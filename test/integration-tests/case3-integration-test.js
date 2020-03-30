const chai = require('chai');
const chaiHttp = require('chai-http');
const dummyData = require('./dummy-data');

chai.should();

chai.use(chaiHttp);

describe("Integration Test Case 3",() => {
    it("Sign Up-In --> Create User-Resource --> Update Resource-Chapter --> Delete User", () => {

        const createdUser = dummyData.userInformations.user3.createdUser;
        const userCredential = dummyData.userInformations.user3.userCredential;
        const updatedUser = dummyData.userInformations.user3.updatedUser;
        const createdResource = dummyData.userInformations.user3.createdResource;
        const updatedResource = dummyData.userInformations.user3.updatedResource;
        const createdChapter = dummyData.userInformations.user3.createdChapter;
        const updatedChapter = dummyData.userInformations.user3.updatedChapter;

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

                                        // Update User
                                        chai.request("localhost:5000/api/users")
                                            .patch(`/${userId}`)
                                            .set("Authorization", bearerToken)
                                            .send(updatedUser)
                                            .end(async (error, response) => {
                                                await response.should.have.status(200);

                                                // Update Resource
                                                chai.request("localhost:5000/api/resources")
                                                    .patch(`/${resourceId}`)
                                                    .set("Authorization", bearerToken)
                                                    .send(updatedResource)
                                                    .end(async (error, response) => {
                                                        await response.should.have.status(200);

                                                        // Update Chapter
                                                        chai.request("localhost:5000/api/chapters")
                                                            .patch(`/${chapterId}`)
                                                            .set("Authorization", bearerToken)
                                                            .send(updatedChapter)
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
});
